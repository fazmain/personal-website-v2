// Press D. Calibration and diagnostics for whoever installs the piece:
//  - top left: frame rate, detector, wall state, recent events, key help
//  - bottom right: the camera's view (mirrored like a mirror), people with id / distance / share
//    of the eyes, and ignore zones. Drag a rectangle on it to ignore that part of the camera
//    (a window, a mirror, a poster, a TV). X clears all zones.
//  - bottom left: a map of the room seen from above: screen, camera, field of view, people.
//  - on the wall: a small dot on each eye in the colour of the person it is assigned to.

import { worldToScreen } from './geometry.js';

const COL = ['#ff5a4f', '#4fd1ff', '#ffd24f', '#7dff6a', '#d77dff', '#ff9f43', '#5ae6c1', '#ff6bd0'];
const colour = id => COL[id % COL.length];

export class Debug {
  constructor(cfg, canvas, hooks) {
    this.cfg = cfg; this.canvas = canvas; this.hooks = hooks; this.on = false;
    this.ctx = canvas.getContext('2d');
    this.prev = { x: 0, y: 0, w: 0, h: 0 };
    this.drag = null;
    canvas.addEventListener('pointerdown', e => {
      const p = this.toPreview(e.clientX, e.clientY);
      if (p) { this.drag = { a: p, b: p }; canvas.setPointerCapture(e.pointerId); }
    });
    canvas.addEventListener('pointermove', e => { if (this.drag) this.drag.b = this.toPreview(e.clientX, e.clientY, true); });
    canvas.addEventListener('pointerup', () => {
      const d = this.drag; this.drag = null;
      if (d && Math.abs(d.a[0] - d.b[0]) > 0.01 && Math.abs(d.a[1] - d.b[1]) > 0.01) this.hooks.addZone([d.a[0], d.a[1], d.b[0], d.b[1]].map(v => +v.toFixed(3)));
    });
  }

  toggle(v = !this.on) {
    this.on = v;
    this.canvas.hidden = !v;
    this.canvas.style.pointerEvents = v ? 'auto' : 'none';
  }

  // preview pixel -> raw camera (u, v)
  toPreview(x, y, clampIt) {
    const p = this.prev;
    let u = (x - p.x) / p.w, v = (y - p.y) / p.h;
    if (!clampIt && (u < 0 || u > 1 || v < 0 || v > 1)) return null;
    u = Math.min(1, Math.max(0, u)); v = Math.min(1, Math.max(0, v));
    return [this.cfg.flipX ? 1 - u : u, v];
  }
  pu(u) { return this.cfg.flipX ? 1 - u : u; }

  draw(s) {
    const c = this.canvas, g = this.ctx;
    if (c.width !== innerWidth || c.height !== innerHeight) { c.width = innerWidth; c.height = innerHeight; }
    g.clearRect(0, 0, c.width, c.height);
    const { rig, eyes, tracks, info, camera } = s;

    // eye assignments
    for (const e of eyes) {
      if (e.mood === 'sleep') continue;
      g.fillStyle = e.focus?.kind === 'track' ? colour(e.focus.id) : e.mood === 'bored' ? '#888' : '#444';
      g.beginPath(); g.arc(e.x, e.y + e.r * 0.9, Math.max(2, e.r * 0.06), 0, 7); g.fill();
    }
    // where each person is, projected onto the wall
    for (const t of tracks) {
      if (t.state === 'tentative') continue;
      const p = worldToScreen(rig, t);
      g.strokeStyle = colour(t.id); g.lineWidth = 2;
      g.beginPath(); g.arc(p.x, p.y, 18, 0, 7); g.moveTo(p.x - 28, p.y); g.lineTo(p.x + 28, p.y); g.moveTo(p.x, p.y - 28); g.lineTo(p.x, p.y + 28); g.stroke();
    }

    // text panel
    const sal = s.sal, total = [...sal.values()].reduce((a, b) => a + b, 0) || 1;
    const count = new Map();
    for (const e of eyes) if (e.focus?.kind === 'track') count.set(e.focus.id, (count.get(e.focus.id) || 0) + 1);
    const lines = [
      `ALL EYES ON YOU  debug`,
      `${s.perf.fps.toFixed(0)} fps  dpr ${s.dpr.toFixed(2)}  ${eyes.length} eyes  seed ${this.cfg.seed}`,
      `source: ${s.src}${camera ? `  detector: ${camera.detectorInfo || 'loading…'}  ${camera.ms.toFixed(0)} ms` : ''}`,
      `wall: ${info.state}   light ${s.attention.light.toFixed(2)}`,
      ...tracks.map(t => `#${t.id} ${t.state}${t.static ? ' STATIC' : ''}${t.overflow ? ' overflow' : ''}  z ${t.z.toFixed(2)}m  x ${t.x.toFixed(2)}  v ${t.speed.toFixed(2)}  still ${(t.stillS || 0).toFixed(0)}s  face ${t.facing == null ? '-' : t.facing.toFixed(1)}  sal ${((sal.get(t.id) || 0) / total * 100).toFixed(0)}%  eyes ${count.get(t.id) || 0}`),
      ``,
      ...s.attention.events.slice(-5).map(ev => `${((s.now - ev.t) / 1000).toFixed(1)}s ago: ${ev.type}${ev.id != null ? ' #' + ev.id : ''}`),
      ``,
      ...s.log.slice(-4),
      ``,
      `D debug  F fullscreen  C next camera  M mouse/camera  R new arrangement  X clear zones  drag on preview = ignore zone`,
    ];
    g.font = '12px ui-monospace, Menlo, monospace';
    g.fillStyle = 'rgba(0,0,0,0.6)';
    g.fillRect(8, 8, 640, lines.length * 16 + 10);
    g.fillStyle = '#e8e2d8';
    lines.forEach((l, i) => g.fillText(l, 16, 26 + i * 16));

    // camera preview
    const v = camera?.video;
    const pw = Math.min(360, c.width * 0.3), ph = pw / (rig.imageAspect || 16 / 9);
    const px = c.width - pw - 12, py = c.height - ph - 12;
    this.prev = { x: px, y: py, w: pw, h: ph };
    g.fillStyle = '#111'; g.fillRect(px, py, pw, ph);
    if (v && v.readyState >= 2) {
      g.save();
      if (this.cfg.flipX) { g.translate(px + pw, py); g.scale(-1, 1); g.drawImage(v, 0, 0, pw, ph); }
      else g.drawImage(v, px, py, pw, ph);
      g.restore();
    } else { g.fillStyle = '#777'; g.fillText(s.src === 'camera' ? 'camera starting…' : `no camera (${s.src})`, px + 10, py + 20); }
    const U = u => px + this.pu(u) * pw, Vy = y => py + y * ph;
    for (const z of this.cfg.ignoreZones) {
      const x0 = Math.min(U(z[0]), U(z[2])), x1 = Math.max(U(z[0]), U(z[2]));
      g.fillStyle = 'rgba(255,40,40,0.25)'; g.fillRect(x0, Vy(Math.min(z[1], z[3])), x1 - x0, Math.abs(z[3] - z[1]) * ph);
    }
    if (this.drag) {
      const a = this.drag.a, b = this.drag.b;
      g.strokeStyle = '#f44'; g.strokeRect(Math.min(U(a[0]), U(b[0])), Vy(Math.min(a[1], b[1])), Math.abs(U(a[0]) - U(b[0])), Math.abs(a[1] - b[1]) * ph);
    }
    for (const t of tracks) {
      g.strokeStyle = t.state === 'tentative' ? '#777' : t.static ? '#aaa' : t.state === 'coasting' ? '#fa3' : colour(t.id);
      g.setLineDash(t.state === 'tentative' ? [4, 4] : []);
      if (t.box) {
        const [bx, by, bw, bh] = t.box;
        const x0 = Math.min(U(bx), U(bx + bw));
        g.strokeRect(x0, Vy(by), bw * pw, bh * ph);
      }
      g.setLineDash([]);
      g.beginPath(); g.arc(U(t.u), Vy(t.v), 4, 0, 7); g.stroke();
      g.fillStyle = g.strokeStyle;
      g.fillText(`#${t.id} ${t.z.toFixed(1)}m${t.static ? ' static' : ''}`, U(t.u) + 6, Vy(t.v) - 6);
    }

    // room map (top view): screen along the top, room below
    const mw = 240, mh = 180, mx = 12, my = c.height - mh - 12, sc = mw / 7;
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(mx, my, mw, mh);
    const X = x => mx + mw / 2 + x * sc, Z = z => my + 12 + z * sc;
    g.strokeStyle = '#e8e2d8'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(-rig.W / 2), Z(0)); g.lineTo(X(rig.W / 2), Z(0)); g.stroke(); g.lineWidth = 1;
    g.strokeStyle = 'rgba(255,255,255,0.25)';
    g.beginPath(); g.moveTo(X(rig.cam.x), Z(0)); g.lineTo(X(rig.cam.x + rig.tanH * 6 * rig.flip), Z(6)); g.moveTo(X(rig.cam.x), Z(0)); g.lineTo(X(rig.cam.x - rig.tanH * 6 * rig.flip), Z(6)); g.stroke();
    g.setLineDash([3, 3]); g.beginPath(); g.moveTo(mx, Z(this.cfg.maxDistanceM)); g.lineTo(mx + mw, Z(this.cfg.maxDistanceM)); g.stroke(); g.setLineDash([]);
    for (const t of tracks) {
      g.fillStyle = t.state === 'tentative' ? '#666' : t.static ? '#aaa' : colour(t.id);
      g.beginPath(); g.arc(X(t.x), Z(t.z), 5, 0, 7); g.fill();
    }
    g.fillStyle = '#aaa'; g.fillText('room from above (1 m grid)', mx + 6, my + mh - 6);
    for (let m = 1; m < 7; m++) { g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(mx, Z(m), mw, 1); }
  }
}
