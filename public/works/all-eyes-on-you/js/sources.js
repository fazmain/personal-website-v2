// Where observations come from: the webcam (normal), the mouse (no camera), or simulated visitors
// (for testing edge cases and demos). Every source answers poll(now) with either null (nothing new
// this frame) or a fresh list of observations, and blind(now) when it cannot currently see.

import { toObservations } from './observe.js';
import { worldToImage, setImageAspect, mulberry32 } from './geometry.js';

const BASE = new URL('../', import.meta.url).href;

// ---------------------------------------------------------------- camera
export class CameraSource {
  constructor(cfg, rig, status) {
    this.cfg = cfg; this.rig = rig; this.status = status;
    this.video = Object.assign(document.createElement('video'), { muted: true, playsInline: true, autoplay: true });
    this.kind = cfg.detector === 'object' || cfg.detector === 'motion' ? cfg.detector : 'pose';
    this.pending = null; this.busy = false; this.lastSent = 0; this.lastResult = -1e9; this.ms = 0;
    this.ready = false; this.live = false; this.people = []; this.frameW = 0; this.frameH = 0;
    this.devices = [];
  }

  async start() {
    await this.openCamera();   // the model (~17 MB) is loaded only once a camera actually opens
    navigator.mediaDevices?.addEventListener?.('devicechange', () => { if (!this.live) this.openCamera(); });
  }

  async openCamera(deviceId = this.cfg.cameraId) {
    clearTimeout(this.retry);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera API (needs https or localhost)');
      this.stream?.getTracks().forEach(t => t.stop());
      const video = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
      if (deviceId) video.deviceId = { exact: deviceId };
      else video.facingMode = 'user';
      let stream;
      try { stream = await navigator.mediaDevices.getUserMedia({ video, audio: false }); }
      catch (e) {
        if (deviceId && (e.name === 'OverconstrainedError' || e.name === 'NotFoundError')) return this.openCamera(null);   // remembered camera unplugged
        throw e;
      }
      this.devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
      if (this.cfg.cameraLabel && !deviceId) {
        const want = this.devices.find(d => d.label.toLowerCase().includes(this.cfg.cameraLabel.toLowerCase()));
        if (want && want.deviceId !== stream.getVideoTracks()[0].getSettings().deviceId) { stream.getTracks().forEach(t => t.stop()); return this.openCamera(want.deviceId); }
      }
      this.stream = stream;
      const track = stream.getVideoTracks()[0];
      this.deviceId = track.getSettings().deviceId;
      this.label = track.label;
      track.addEventListener('ended', () => this.lost('camera disconnected'));
      this.video.srcObject = stream;
      await this.video.play().catch(() => {});
      await new Promise(r => this.video.videoWidth ? r() : this.video.addEventListener('loadedmetadata', r, { once: true }));
      setImageAspect(this.rig, this.video.videoWidth / this.video.videoHeight);
      this.live = true;
      this.status(`camera: ${this.label || 'on'} ${this.video.videoWidth}x${this.video.videoHeight}`);
      if (!this.detectorStarted) { this.detectorStarted = true; this.startDetector(); }
    } catch (e) {
      this.lost(e.name === 'NotAllowedError' ? 'camera permission denied' : `camera: ${e.message || e.name}`);
      if (e.name === 'NotAllowedError') this.denied = true;
    }
  }

  lost(msg) {
    this.live = false;
    this.status(msg);
    clearTimeout(this.retry);
    if (!this.denied) this.retry = setTimeout(() => this.openCamera(), 3000);   // keep trying: someone may plug it back in
  }

  async nextCamera() {
    if (this.devices.length < 2) return;
    const i = this.devices.findIndex(d => d.deviceId === this.deviceId);
    const d = this.devices[(i + 1) % this.devices.length];
    await this.openCamera(d.deviceId);
    return d.deviceId;
  }

  async startDetector() {
    const opts = { kind: this.kind, model: this.cfg.model, base: BASE, numPoses: this.cfg.maxPeople + 2, minConf: this.cfg.minConfidence };
    const inMain = async (kind) => {
      const core = await import('./detect-core.js');
      const info = await core.initDetector({ ...opts, kind });
      this.mainDetect = core.detect;
      return info;
    };
    let info = null;
    if (this.cfg.worker && typeof Worker !== 'undefined') {
      info = await new Promise(resolve => {
        let w;
        try { w = new Worker(new URL('./detect-worker.js', import.meta.url), { type: 'module' }); }
        catch { return resolve(null); }
        const timer = setTimeout(() => { w.terminate(); resolve(null); }, 30000);
        w.onerror = () => { clearTimeout(timer); w.terminate(); resolve(null); };
        w.onmessage = ({ data }) => {
          if (data.type === 'ready') { clearTimeout(timer); this.worker = w; w.onmessage = m => this.onResult(m.data); resolve(data); }
          else if (data.type === 'error') { clearTimeout(timer); w.terminate(); console.warn('[eyes] worker detector:', data.message); resolve(null); }
        };
        w.postMessage({ type: 'init', opts });
      });
    }
    if (!info) {
      try { info = await inMain(this.kind); }
      catch (e) {
        console.warn('[eyes] detector failed, falling back to motion:', e);
        this.status('model failed to load: using motion');
        info = await inMain('motion');
      }
    }
    this.detectorInfo = `${info.kind} (${info.delegate}${this.worker ? ', worker' : ''})`;
    this.ready = true;
    this.status(`detector: ${this.detectorInfo}`);
  }

  onResult(d) {
    this.busy = false;
    clearTimeout(this.watchdog);
    if (d.type !== 'result') return;
    this.ms = d.ms; this.lastResult = performance.now();
    this.frameW = d.w; this.frameH = d.h;
    this.people = d.people;
    this.pending = toObservations(d.people, this.rig, d.w, d.h);
    if (d.error) console.warn('[eyes] detect:', d.error);
  }

  async send(now) {
    const v = this.video;
    if (!this.ready || this.busy || !this.live || v.readyState < 2 || now - this.lastSent < 1000 / this.cfg.detectFps) return;
    this.busy = true; this.lastSent = now;
    clearTimeout(this.watchdog);
    this.watchdog = setTimeout(() => { this.busy = false; }, 2000);   // a lost message must not stop detection forever
    try {
      const scale = Math.min(1, 640 / v.videoWidth);
      const bitmap = await createImageBitmap(v, { resizeWidth: Math.round(v.videoWidth * scale), resizeHeight: Math.round(v.videoHeight * scale) });
      if (this.worker) this.worker.postMessage({ type: 'frame', bitmap, ts: now }, [bitmap]);
      else {
        const t0 = performance.now();
        const people = this.mainDetect(bitmap, bitmap.width, bitmap.height, now);
        this.onResult({ type: 'result', people, w: bitmap.width, h: bitmap.height, ms: performance.now() - t0 });
        bitmap.close();
      }
    } catch (e) { this.busy = false; }
    finally { if (!this.worker) { clearTimeout(this.watchdog); this.busy = false; } }
  }

  poll(now) {
    this.send(now);
    const p = this.pending; this.pending = null;
    return p;
  }

  blind(now) { return !this.live || !this.ready || now - this.lastResult > this.cfg.staleCameraMs; }
}

// ---------------------------------------------------------------- mouse (no camera: the cursor is the visitor)
export class MouseSource {
  constructor(cfg, rig) {
    this.cfg = cfg; this.rig = rig; this.pos = null; this.z = 1.6; this.last = -1e9;
    const move = (x, y) => { this.pos = { x, y }; this.last = performance.now(); };
    addEventListener('pointermove', e => move(e.clientX, e.clientY));
    addEventListener('pointerdown', e => move(e.clientX, e.clientY));
    document.documentElement.addEventListener('mouseleave', () => { this.pos = null; });
    addEventListener('wheel', e => { this.z = Math.min(5, Math.max(0.5, this.z * (1 + e.deltaY * 0.001))); this.last = performance.now(); }, { passive: true });
  }
  poll(now) {
    if (!this.pos || now - this.last > 8000) return [];   // a still cursor is a visitor who has left
    const r = this.rig;
    const x = (this.pos.x / r.pxW - 0.5) * r.W * (this.z / 1.2);
    const y = (0.5 - this.pos.y / r.pxH) * r.H * 0.9;
    const p = { x, y, z: this.z };
    const im = worldToImage(r, p);
    return [{ ...p, u: im.u, v: im.v, conf: 1, facing: 1, size: 0.1 }];
  }
  blind() { return false; }
}

// ---------------------------------------------------------------- simulated visitors
// Scenarios exercise the edge cases on screen: two, background, group, crowd, poster, passby, flicker.
export class SimSource {
  constructor(cfg, rig) {
    this.cfg = cfg; this.rig = rig; this.rng = mulberry32(cfg.seed ^ 0xbeef);
    this.people = []; this.t0 = null; this.nextSpawn = 0; this.lastPoll = 0;
    this.scenario = cfg.scenario || 'wander';
  }
  person(o) {
    const r = this.rng;
    return { x: -3.5, y: 0.1, z: 2, vx: 0, tx: 0, tz: 2, speed: 0.8, pauseUntil: 0, facing: 1, leaveAt: Infinity,
      height: -0.05 + (r() - 0.5) * 0.3, id: Math.random(), phase: r() * 6, ...o };
  }
  setup(now) {
    const P = o => this.people.push(this.person(o));
    const s = this.scenario;
    if (s === 'two') { P({ x: -1.2, tx: -0.8, z: 1.8, tz: 1.8 }); P({ x: 1.4, tx: 0.9, z: 2.2, tz: 2.2, roam: true }); }
    else if (s === 'background') { P({ x: -0.3, tx: 0.2, z: 1.4, tz: 1.4, roam: 0.3 }); P({ x: -4, tx: 4, z: 5.2, tz: 5.2, speed: 0.9, loop: true }); }
    else if (s === 'group') { for (let i = 0; i < 5; i++) P({ x: -4 - i * 0.4, tx: -0.9 + i * 0.45, z: 1.8 + (i % 2) * 0.6, tz: 1.8 + (i % 2) * 0.6, speed: 0.7, roam: 0.25 }); }
    else if (s === 'crowd') { for (let i = 0; i < 9; i++) P({ x: (this.rng() - 0.5) * 5, tx: (this.rng() - 0.5) * 4, z: 1.3 + this.rng() * 3, tz: 1.3 + this.rng() * 3, roam: 1 }); }
    else if (s === 'poster') { P({ x: -1.1, tx: -1.1, z: 3, tz: 3, still: true, speed: 0 }); P({ x: 3.5, tx: 0.6, z: 1.6, tz: 1.6, roam: 0.6, leaveAt: now + 14000 }); }
    else if (s === 'flicker') { P({ x: 0, tx: 0.3, z: 1.7, tz: 1.7, roam: 0.4 }); }
  }
  step(now, dt) {
    const r = this.rng;
    if (this.t0 == null) { this.t0 = now; this.setup(now); }
    // wander / passby: people come and go on their own
    if ((this.scenario === 'wander' || this.scenario === 'passby') && now > this.nextSpawn) {
      const max = this.scenario === 'passby' ? 1 : Math.max(1, this.cfg.sim);
      if (this.people.length < max) {
        const from = r() < 0.5 ? -1 : 1;
        const z = 1.2 + r() * 2.5;
        this.people.push(this.person({ x: from * 3.8 * (z / 2), tx: (r() - 0.5) * 1.6, z, tz: z, speed: 0.6 + r() * 0.8,
          roam: this.scenario === 'wander' ? 0.8 : 0, leaveAt: now + (this.scenario === 'passby' ? 0 : 9000 + r() * 16000), exit: -from }));
      }
      this.nextSpawn = now + (this.scenario === 'passby' ? 4000 + r() * 5000 : 3000 + r() * 9000);
    }
    for (const p of this.people) {
      if (now > p.leaveAt && !p.leaving) { p.leaving = true; p.tx = (p.exit ?? 1) * 5 * (p.z / 2); p.pauseUntil = 0; p.speed = Math.max(p.speed, 0.8); }
      if (p.still) continue;
      if (now < p.pauseUntil) { p.facing = 0.9; continue; }
      const dx = p.tx - p.x, dz = p.tz - p.z, d = Math.hypot(dx, dz);
      if (d < 0.05) {
        if (p.loop) { p.tx = -p.tx; continue; }
        if (p.roam) {
          p.pauseUntil = now + 1500 + r() * 6000;
          p.tx = p.x + (r() - 0.5) * 2 * p.roam; p.tz = Math.min(4.5, Math.max(0.8, p.z + (r() - 0.5) * p.roam));
        }
        continue;
      }
      const step = Math.min(d, p.speed * dt);
      p.x += dx / d * step; p.z += dz / d * step;
      p.facing = Math.abs(dx) > 0.2 ? 0.2 : 0.8;
    }
    this.people = this.people.filter(p => !(p.leaving && Math.abs(p.x) > 4.5 * (p.z / 2)));
  }
  poll(now) {
    const dt = Math.min(0.1, (now - (this.lastPoll || now)) / 1000);
    if (now - this.lastPoll < 1000 / this.cfg.detectFps) return null;   // behave like a real detector's frame rate
    this.lastPoll = now;
    this.step(now, Math.max(dt, 1 / this.cfg.detectFps));
    const r = this.rng, out = [];
    for (const p of this.people) {
      if (r() < 0.06) continue;   // missed detection
      const n = 0.012;            // landmark jitter
      const w = { x: p.x + (r() - 0.5) * n, y: p.height + Math.sin(now * 0.002 + p.phase) * 0.01 * (p.still ? 0 : 1) + (r() - 0.5) * n, z: p.z * (1 + (r() - 0.5) * 0.06) };
      const im = worldToImage(this.rig, w);
      if (im.u < 0 || im.u > 1 || im.v < 0 || im.v > 1 || im.depth <= 0) continue;   // outside the camera's view
      out.push({ ...w, u: im.u, v: im.v, conf: 0.9, facing: p.facing, size: 0.1 });
    }
    if (this.scenario === 'flicker' && r() < 0.25) {   // ghosts: one-frame false detections
      const w = { x: (r() - 0.5) * 4, y: (r() - 0.5), z: 1 + r() * 3 };
      const im = worldToImage(this.rig, w);
      out.push({ ...w, u: im.u, v: im.v, conf: 0.6, facing: null });
    }
    return out;
  }
  blind() { return false; }
}
