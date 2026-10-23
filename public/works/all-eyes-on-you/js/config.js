// All Eyes On You: settings.
// Every value can be overridden from the URL (?screenWidthM=3.2&debug=1) and a few
// that are set interactively (ignore zones, camera choice) are remembered in localStorage.

export const DEFAULTS = {
  // Physical rig. World units are metres; the origin is the centre of the image,
  // x points right (as the viewer sees it), y up, z out of the screen towards the room.
  screenWidthM: 1.6,       // width of the visible picture. 65" monitor ~1.43, projection often 2.5-4
  cameraX: 0,              // camera position relative to picture centre (m)
  cameraY: 'top',          // 'top' | 'bottom' | metres
  cameraHFovDeg: 70,       // horizontal field of view of the webcam
  cameraTiltDeg: 6,        // positive = camera pitched down towards the floor
  flipX: true,             // raw webcam frames are not mirrored; set false if the driver mirrors them

  // Detection
  detector: 'pose',        // pose | object | motion | mouse | sim
  model: 'lite',           // pose model: lite | full
  maxPeople: 6,            // most people tracked at once (a crowd is sampled nearest-first)
  minConfidence: 0.45,
  detectFps: 20,
  maxDistanceM: 6,         // anything farther away is the background and ignored
  minDistanceM: 0.25,
  ignoreZones: [],         // [[u0,v0,u1,v1], ...] rectangles in the raw camera image (0..1)
  cameraLabel: '',         // pick a camera whose label contains this text
  worker: true,            // run the detector off the main thread

  // Tracking
  confirmHits: 3,          // detections needed before a person is believed
  confirmMs: 150,
  graceMs: 900,            // how long a lost person is remembered (occlusion, missed frames)
  staticAfterS: 90,        // a "person" who never moves for this long is a poster / mannequin
  staticMoveM: 0.07,
  staleCameraMs: 1500,     // no new frames for this long = the camera is blind

  // Attention
  boredAfterS: 14,         // standing still this long starts to bore the eyes
  contactHoldS: 2.4,       // a held, still, frontal gaze this long makes the whole wall blink together
  contactCooldownS: 30,
  searchS: 2.6,            // after the last person leaves: look around for them
  afterimageS: 4.5,        // then stare at where they left
  sleepAfterS: 75,         // then drowse and finally sleep

  // Look
  seed: 0,                 // 0 = new arrangement each start
  maxEyes: 340,
  density: 1,
  reflections: true,       // the viewer appears, tiny and curved, in every cornea
  reflectStrength: 0.35,
  maxDpr: 1.5,
  renderScale: 1,
  adaptive: true,          // lower resolution / eye count if frame rate drops

  // Installation
  reloadEveryH: 0,         // reload the page every N hours (0 = never), for week-long runs
  debug: false,
  cursorHideMs: 1500,
  sim: 0,                  // number of simulated visitors (detector=sim)
  scenario: '',            // named simulation: two | background | group | poster | passby | crowd
};

const STORE = 'all-eyes-on-you:';

function coerce(raw, def) {
  if (typeof def === 'number') { const n = parseFloat(raw); return Number.isFinite(n) ? n : def; }
  if (typeof def === 'boolean') return !(raw === '0' || raw === 'false' || raw === 'no' || raw === 'off');
  if (Array.isArray(def)) { try { const v = JSON.parse(raw); return Array.isArray(v) ? v : def; } catch { return def; } }
  if (def === 'top' && raw !== 'top' && raw !== 'bottom') { const n = parseFloat(raw); return Number.isFinite(n) ? n : def; }
  return raw;
}

export function loadConfig(search = globalThis.location?.search ?? '') {
  const cfg = { ...DEFAULTS };
  try {
    const z = localStorage.getItem(STORE + 'ignoreZones');
    if (z) cfg.ignoreZones = JSON.parse(z);
    const cam = localStorage.getItem(STORE + 'cameraId');
    if (cam) cfg.cameraId = cam;
  } catch { /* storage blocked: defaults are fine */ }
  const q = new URLSearchParams(search);
  for (const [k, v] of q) if (k in DEFAULTS) cfg[k] = coerce(v, DEFAULTS[k]);
  if (q.has('debug') && q.get('debug') === '') cfg.debug = true;
  if (!cfg.seed) cfg.seed = (Math.random() * 1e9) | 0;
  if (cfg.detector === 'sim' && !cfg.sim && !cfg.scenario) cfg.sim = 2;
  return cfg;
}

export function remember(key, value) {
  try {
    if (value == null) localStorage.removeItem(STORE + key);
    else localStorage.setItem(STORE + key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch { /* ignore */ }
}
