import { loadConfig, remember } from './config.js';
import { makeRig } from './geometry.js';
import { layoutEyes, stepEye } from './eyes.js';
import { Tracker } from './tracker.js';
import { Attention } from './attention.js';
import { Renderer } from './render.js';
import { CameraSource, MouseSource, SimSource } from './sources.js';
import { Debug } from './debug.js';

const cfg = loadConfig();
const canvas = document.getElementById('eyes');
const note = document.getElementById('note');
const log = [];
const status = msg => { log.push(msg); if (log.length > 8) log.shift(); console.info('[eyes]', msg); };

let renderer;
try { renderer = new Renderer(canvas); }
catch (e) {
  note.textContent = 'This piece needs WebGL2 (a recent Chrome, Edge, Firefox or Safari with hardware acceleration on).';
  note.hidden = false;
  throw e;
}

let rig, eyes, dpr = Math.min(devicePixelRatio || 1, cfg.maxDpr) * cfg.renderScale;
function layout() {
  const w = innerWidth, h = innerHeight;
  const aspect = rig?.imageAspect ?? 16 / 9;
  rig = makeRig(cfg, w, h, aspect);
  const old = eyes;
  eyes = layoutEyes(w, h, cfg, rig);
  if (old) for (const e of eyes) { e.open = 0.4; e.mood = 'drowsy'; }   // a new arrangement opens its eyes
  renderer.resize(w, h, dpr);
  if (sources) for (const s of Object.values(sources)) if (s) s.rig = rig;
}
let sources = null;
layout();

const tracker = new Tracker(cfg);
const attention = new Attention(cfg);

// ---- sources: camera normally; the mouse stands in whenever the camera cannot see
const mouse = new MouseSource(cfg, rig);
let camera = null, sim = null;
if (cfg.detector === 'sim' || cfg.scenario) sim = new SimSource(cfg, rig);
else if (cfg.detector !== 'mouse') { camera = new CameraSource(cfg, rig, status); camera.start(); }
sources = { mouse, camera, sim };
let forceMouse = cfg.detector === 'mouse';

const debug = new Debug(cfg, document.getElementById('debug'), {
  addZone(z) { cfg.ignoreZones.push(z); remember('ignoreZones', cfg.ignoreZones); status(`ignore zone added (${cfg.ignoreZones.length})`); },
});
if (cfg.debug) debug.toggle(true);

// ---- keys
addEventListener('keydown', async e => {
  const k = e.key.toLowerCase();
  if (k === 'd') debug.toggle();
  else if (k === 'f') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {}); }
  else if (k === 'r') { cfg.seed = (cfg.seed + 7919) >>> 0; layout(); status(`new arrangement, seed ${cfg.seed}`); }
  else if (k === 'm') { forceMouse = !forceMouse; tracker.reset(); status(forceMouse ? 'mouse is the visitor' : 'camera is the visitor'); }
  else if (k === 'c' && camera) { const id = await camera.nextCamera(); if (id) remember('cameraId', id); }
  else if (k === 'x') { cfg.ignoreZones = []; remember('ignoreZones', null); status('ignore zones cleared'); }
});

let resizeT;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(layout, 250); });

// ---- installation hygiene: keep the screen awake, hide the cursor, optional periodic reload
let wake = null;
const keepAwake = async () => { try { if (document.visibilityState === 'visible') wake = await navigator.wakeLock?.request('screen'); } catch { /* not allowed: fine */ } };
keepAwake();
document.addEventListener('visibilitychange', keepAwake);
let cursorT;
addEventListener('pointermove', () => {
  document.body.classList.remove('nocursor');
  clearTimeout(cursorT);
  cursorT = setTimeout(() => document.body.classList.add('nocursor'), cfg.cursorHideMs);
});
document.body.classList.add('nocursor');
if (cfg.reloadEveryH > 0) setTimeout(() => location.reload(), cfg.reloadEveryH * 3600e3);

// ---- the loop
let last = performance.now();
const perf = { acc: 0, n: 0, fps: 60, since: last };
const world = { trackById: new Map(), eyes: null, dark: 1 };

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));   // a hidden tab must not make the eyes teleport
  last = now;

  let obs = null, src = 'none';
  if (sim) { obs = sim.poll(now); src = 'sim'; }
  else if (camera && !forceMouse && !camera.blind(now)) { obs = camera.poll(now); src = 'camera'; }
  else {
    camera?.poll(now);                          // keep trying to see
    obs = mouse.poll(now); src = 'mouse';
  }
  const tracks = obs ? tracker.update(obs, now) : tracker.tick(now);

  const info = attention.update(now, dt, tracks, eyes, rig);
  world.trackById.clear();
  for (const t of tracks) if (t.state !== 'tentative') world.trackById.set(t.id, t);
  world.eyes = eyes;
  for (const e of eyes) stepEye(e, dt, now, world);

  renderer.draw(eyes, {
    light: attention.light, time: now / 1000,
    video: src === 'camera' ? camera.video : null,
    reflect: cfg.reflections ? cfg.reflectStrength : 0,
    flip: cfg.flipX ? 1 : -1,
  });

  // adaptive quality: the eyes' motion matters more than their resolution
  perf.acc += dt; perf.n++;
  if (now - perf.since > 2000) {
    perf.fps = perf.n / perf.acc; window.__fps = perf.fps; perf.acc = 0; perf.n = 0; perf.since = now;
    if (cfg.adaptive && perf.fps < 42 && dpr > 0.6) { dpr = Math.max(0.6, dpr - 0.15); renderer.resize(innerWidth, innerHeight, dpr); status(`low frame rate: resolution x${dpr.toFixed(2)}`); }
  }

  if (debug.on) debug.draw({ now, rig, eyes, tracks, info, attention, camera, src, perf, dpr, log, sal: attention.sal });
}
requestAnimationFrame(frame);

// for poking at from the console
window.eyesOnYou = { cfg, get eyes() { return eyes; }, tracker, attention, get rig() { return rig; }, camera, sim, mouse };
