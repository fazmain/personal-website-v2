// Almanac — the viewing room.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const CARD_W = 2.5, CARD_H = 3.5, CARD_T = 0.014, CORNER = 0.113;
const TAU = Math.PI * 2;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const IDS = ['JR', ...['H', 'D', 'C', 'S'].flatMap((s) => RANKS.map((r) => r + s)), 'JB'];
const GILT = new Set(['JR', 'JB', 'BACK', ...['H', 'D', 'C', 'S'].flatMap((s) => ['A', 'J', 'Q', 'K'].map((r) => r + s))]);
const N = IDS.length;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Renderer, scene, camera
const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
const BG = new THREE.Color('#0a0807');
scene.background = BG;
scene.fog = new THREE.Fog(BG, 18, 42);

const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTex;
scene.environmentIntensity = 0.28;

const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
scene.add(camera);

// Light: one warm museum spot from above, a cool whisper of fill, a rim from behind.
const spot = new THREE.SpotLight('#ffe6c4', 0, 40, 0.46, 0.75, 1.4);
spot.position.set(1.5, 17, 5.5);
spot.target.position.set(0, 0, 0.3);
spot.castShadow = true;
spot.shadow.mapSize.set(2048, 2048);
spot.shadow.bias = -0.0004;
spot.shadow.normalBias = 0.02;
spot.shadow.radius = 4;
spot.shadow.camera.near = 6; spot.shadow.camera.far = 30;
scene.add(spot, spot.target);
const fill = new THREE.HemisphereLight('#8ea0c8', '#1a120c', 0);
scene.add(fill);
const rim = new THREE.DirectionalLight('#c8b8ff', 0);
rim.position.set(-6, 5, -10);
scene.add(rim);
// A light that follows the inspected card so gilt can catch it.
const keyLight = new THREE.PointLight('#fff1dc', 0, 12, 1.6);
camera.add(keyLight);
keyLight.position.set(2.2, 2.6, 1.0);

// ---------------------------------------------------------------------------
// Table: dark felt with a soft weave, lit only where the spot falls.
function feltTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  const img = x.createImageData(512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + Math.random() * 40;
    img.data[i] = v; img.data[i + 1] = v * 0.93; img.data[i + 2] = v * 0.86; img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  x.globalAlpha = 0.06;
  for (let i = 0; i < 1600; i++) {
    x.strokeStyle = Math.random() < 0.5 ? '#000' : '#fff';
    const px = Math.random() * 512, py = Math.random() * 512, a = Math.random() * TAU, l = 3 + Math.random() * 9;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 14); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const table = new THREE.Mesh(
  new THREE.PlaneGeometry(90, 90),
  new THREE.MeshStandardMaterial({ color: '#2a1f19', map: feltTexture(), roughness: 1, metalness: 0 }),
);
table.rotation.x = -Math.PI / 2;
table.receiveShadow = true;
scene.add(table);

// Dust drifting through the beam
function dustSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,240,215,1)'); g.addColorStop(0.3, 'rgba(255,230,200,.35)'); g.addColorStop(1, 'rgba(255,230,200,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const DUST = 520;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(DUST * 3), dustSeed = new Float32Array(DUST);
for (let i = 0; i < DUST; i++) {
  const r = Math.sqrt(Math.random()) * 5.2, a = Math.random() * TAU, y = Math.random() * 12;
  dustPos[i * 3] = Math.cos(a) * r * (0.5 + y / 20); dustPos[i * 3 + 1] = y; dustPos[i * 3 + 2] = Math.sin(a) * r * (0.5 + y / 20) + 0.5;
  dustSeed[i] = Math.random() * 100;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({ size: 0.05, map: dustSprite(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffe8c8', fog: true });
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

// A faint ring of light that invites the first touch
const invite = new THREE.Mesh(
  new THREE.RingGeometry(2.35, 2.4, 128),
  new THREE.MeshBasicMaterial({ color: '#e9c98a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
);
invite.rotation.x = -Math.PI / 2; invite.position.y = 0.003;
scene.add(invite);

// Veil that dims the room while a card is being examined
const dim = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: '#050403', transparent: true, opacity: 0, depthWrite: false }));
dim.position.set(0, 0, -10.5); dim.renderOrder = 5;
camera.add(dim);

// ---------------------------------------------------------------------------
// Card geometry: a thin rounded slab. Faces are separate so each can be textured.
function roundedShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  return s;
}
const shape = roundedShape(CARD_W, CARD_H, CORNER);
function faceGeometry(mirror) {
  const g = new THREE.ShapeGeometry(shape, 8);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const u = (p.getX(i) + CARD_W / 2) / CARD_W, v = (p.getY(i) + CARD_H / 2) / CARD_H;
    uv.setXY(i, mirror ? 1 - u : u, v);
  }
  return g;
}
const frontGeo = faceGeometry(false); frontGeo.translate(0, 0, CARD_T / 2 + 0.0004);
const backGeo = faceGeometry(true); backGeo.rotateY(Math.PI); backGeo.translate(0, 0, -CARD_T / 2 - 0.0004);
const edgeGeo = new THREE.ExtrudeGeometry(shape, { depth: CARD_T, bevelEnabled: false, curveSegments: 8 });
edgeGeo.translate(0, 0, -CARD_T / 2);
const hiddenMat = new THREE.MeshBasicMaterial({ visible: false });
const edgeMat = new THREE.MeshStandardMaterial({ color: '#c49a4c', metalness: 0.95, roughness: 0.32, envMapIntensity: 1.2 });

// ---------------------------------------------------------------------------
// Textures
const bar = document.getElementById('bar');
let loaded = 0, toLoad = 0;
const loader = new THREE.TextureLoader();
const maxAniso = renderer.capabilities.getMaxAnisotropy();
function tex(url, color = true) {
  toLoad++;
  return new Promise((res) => {
    loader.load(url, (t) => {
      if (color) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = maxAniso;
      loaded++; bar.style.strokeDashoffset = String(150.8 * (1 - loaded / toLoad));
      res(t);
    }, undefined, () => { loaded++; res(null); });
  });
}

function faceMaterial(map, mat) {
  return new THREE.MeshStandardMaterial(mat
    ? { map, roughnessMap: mat, metalnessMap: mat, roughness: 1, metalness: 1, envMapIntensity: 1.6 }
    : { map, roughness: 0.96, metalness: 0, envMapIntensity: 0.35 });
}

// ---------------------------------------------------------------------------
// Cards
const cards = [];
const pick = [];
let backMaterial;
function makeCard(id, i) {
  const group = new THREE.Group();
  const front = new THREE.Mesh(frontGeo, new THREE.MeshStandardMaterial({ color: '#e9dfcc', roughness: 0.9 }));
  const back = new THREE.Mesh(backGeo, backMaterial);
  const edge = new THREE.Mesh(edgeGeo, [hiddenMat, edgeMat]);
  for (const m of [front, back, edge]) { m.castShadow = true; m.receiveShadow = true; m.userData.card = i; group.add(m); }
  scene.add(group);
  pick.push(front, back);
  const c = {
    id, i, group, front,
    pos: new THREE.Vector3(), yaw: 0, tilt: -Math.PI / 2, flip: Math.PI,
    tpos: new THREE.Vector3(), tyaw: 0, ttilt: -Math.PI / 2, tflip: Math.PI,
    delay: 0, speed: 7, jx: (Math.random() - 0.5) * 0.05, jz: (Math.random() - 0.5) * 0.05, jyaw: (Math.random() - 0.5) * 0.035,
    hiRes: null, loadingHi: false, shown: false,
  };
  cards.push(c);
  return c;
}

// ---------------------------------------------------------------------------
// State
const state = {
  ringTurn: 0,
  mode: 'intro',          // intro | deck | fan | inspect
  home: 'deck',           // where an inspected card belongs
  faceUp: false,
  order: IDS.map((_, i) => i),   // order[slot] = card index
  hover: -1,              // hovered slot in the fan
  deckHover: false,
  inspect: -1,            // card index being examined
  spin: 0, spinVel: 0, spinTarget: 0,
  started: false,
  busy: 0,
};
const slotOf = (ci) => state.order.indexOf(ci);

// Camera rig: spherical around a target, everything eased
const rig = {
  target: new THREE.Vector3(0, 0, 0), radius: 22, polar: 0.25, az: 0,
  tTarget: new THREE.Vector3(0, 0.3, 0), tRadius: 10.5, tPolar: 0.95, tAz: 0,
  dragAz: 0, dragPolar: 0, velAz: 0, velPolar: 0, zoom: 1, tZoom: 1, k: 1.1,
};
function setRig(mode) {
  if (mode === 'deck') { rig.tTarget.set(0, 0.2, 0.2); rig.tRadius = 10.8; rig.tPolar = 0.92; }
  if (mode === 'fan') { rig.tTarget.set(0, 0, 1.6); rig.tRadius = camera.aspect < 0.6 ? 44 : camera.aspect < 0.8 ? 38 : camera.aspect < 1.3 ? 30 : 27; rig.tPolar = 0.72; }
}

// ---------------------------------------------------------------------------
// Layouts
// The spread is a ring: the year laid out as a wheel, jokers meeting at the top.
const RING = { R: 7.6 };
function fitFan() {
  RING.R = camera.aspect < 0.8 ? 6.6 : 7.6;
}
function layout() {
  for (let s = 0; s < N; s++) {
    const c = cards[state.order[s]];
    if (c.i === state.inspect) continue;
    if (state.home === 'fan' && state.mode !== 'deck') fanPose(c, s);
    else deckPose(c, s);
  }
}
function deckPose(c, s) {
  const lift = state.deckHover && s === N - 1 && state.mode === 'deck' ? 0.18 : 0;
  c.tpos.set(c.jx, 0.004 + s * CARD_T * 1.04 + lift, c.jz + 0.2);
  c.tyaw = c.jyaw; c.ttilt = -Math.PI / 2;
  c.tflip = state.faceUp ? 0 : Math.PI;
}
function ringDelta(a, b) { let d = a - b; if (d > N / 2) d -= N; if (d < -N / 2) d += N; return d; }
function fanPose(c, s) {
  let th = ((s + 0.5) / N) * TAU + state.ringTurn;
  let push = 0, lift = 0;
  if (state.hover >= 0 && state.mode === 'fan') {
    const d = ringDelta(s, state.hover);
    if (d === 0) { push = 0.9; lift = 0.3; }
    else th += Math.sign(d) * 0.045 * Math.exp(-(Math.abs(d) - 1) / 2);
  }
  const r = RING.R + push;
  c.tpos.set(Math.sin(th) * r, 0.006 + (s % 2) * 0.017 + lift, -Math.cos(th) * r);
  c.tyaw = -th; c.ttilt = -Math.PI / 2;
  c.tflip = state.faceUp || c.shown ? 0 : Math.PI;
}
const _v = new THREE.Vector3(), _dir = new THREE.Vector3();
function inspectDistance() {
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const dh = CARD_H / (0.78 * 2 * tanH);
  const dw = CARD_W / (0.8 * 2 * tanH * camera.aspect);
  return Math.max(dh, dw);
}
function inspectPose(c) {
  camera.getWorldDirection(_dir);
  const d = inspectDistance();
  c.tpos.copy(camera.position).addScaledVector(_dir, d);
  c.tpos.y += Math.sin(clock.elapsedTime * 0.9) * 0.03;
  _v.copy(camera.position).sub(c.tpos);
  const yaw = Math.atan2(_v.x, _v.z);
  const elev = Math.asin(_v.y / _v.length());
  c.tyaw = yaw + pointer.sx * 0.22;
  c.ttilt = -elev - pointer.sy * 0.16;
  c.tflip = state.spinTarget + state.spin;
}

// ---------------------------------------------------------------------------
// Motion: every card eases toward its target; distance travelled lifts it
// into a gentle arc, and turning over lifts it off the cloth.
const _q = new THREE.Quaternion(), _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _qc = new THREE.Quaternion();
const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0);
function step(dt, now) {
  layout(now);
  if (state.inspect >= 0) inspectPose(cards[state.inspect]);
  for (const c of cards) {
    if (now < c.delay) { apply(c, 0); continue; }
    const k = 1 - Math.exp(-c.speed * dt);
    const dist = c.pos.distanceTo(c.tpos);
    c.pos.lerp(c.tpos, k);
    c.yaw += (c.tyaw - c.yaw) * k;
    c.tilt += (c.ttilt - c.tilt) * k;
    c.flip += (c.tflip - c.flip) * Math.min(1, k * 0.9);
    const turning = Math.abs(c.tflip - c.flip);
    const arc = Math.min(1.6, dist * 0.18) + Math.sin(Math.min(Math.PI, turning)) * 0.55 * (c.i === state.inspect ? 0 : 1);
    apply(c, arc);
  }
}
function apply(c, arc) {
  c.group.position.set(c.pos.x, c.pos.y + arc, c.pos.z);
  _qa.setFromAxisAngle(AY, c.yaw);
  _qb.setFromAxisAngle(AX, c.tilt);
  _qc.setFromAxisAngle(AY, c.flip);
  c.group.quaternion.copy(_qa).multiply(_qb).multiply(_qc);
}

// ---------------------------------------------------------------------------
// Sound: paper and felt, synthesised
const sound = {
  ctx: null, on: true, last: 0, noise: null,
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const len = this.ctx.sampleRate * 0.5;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.master = this.ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ctx.destination);
  },
  burst(dur, freq, q, gain, when = 0) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource(); src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq * (0.85 + Math.random() * 0.3); f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.012, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
  },
  slide(gain = 0.25, when = 0) { this.burst(0.13, 2600, 0.9, gain, when); },
  snap(when = 0) { this.burst(0.05, 4200, 1.6, 0.35, when); this.burst(0.09, 380, 1.2, 0.25, when); },
  flick(when = 0) { this.burst(0.07, 3400, 1.1, 0.22, when); },
  ripple(n, spacing, kind = 'slide', gain = 0.16) {
    for (let i = 0; i < n; i++) {
      if (i % 2) continue;
      if (kind === 'slide') this.slide(gain * (0.6 + Math.random() * 0.5), i * spacing);
      else this.flick(i * spacing);
    }
  },
};

// ---------------------------------------------------------------------------
// Actions
const clock = { elapsedTime: 0, last: performance.now(), getDelta() { const n = performance.now(); const d = (n - this.last) / 1000; this.last = n; this.elapsedTime += Math.min(d, 0.1); return d; } };
const now = () => clock.elapsedTime;

function stagger(fn, spacing, reverse = false) {
  const t = now();
  for (let s = 0; s < N; s++) {
    const c = cards[state.order[s]];
    const k = reverse ? N - 1 - s : s;
    c.delay = t + k * spacing;
    fn?.(c, s);
  }
}

function spread() {
  if (state.mode !== 'deck') return;
  state.mode = 'fan'; state.home = 'fan'; state.hover = -1; state.deckHover = false;
  setRig('fan');
  stagger((c) => (c.speed = 5.2), reduceMotion ? 0 : 0.018, true);
  sound.ripple(N, 0.018, 'slide', 0.14);
  touched();
  syncUI();
}
function gather() {
  if (state.mode !== 'fan') return;
  state.mode = 'deck'; state.home = 'deck'; state.hover = -1;
  for (const c of cards) c.shown = false;
  setRig('deck');
  stagger((c) => (c.speed = 6), reduceMotion ? 0 : 0.012);
  sound.ripple(N, 0.012, 'slide', 0.12);
  syncUI();
}
function flipAll() {
  if (state.mode === 'inspect') { turnInspected(); return; }
  state.faceUp = !state.faceUp;
  for (const c of cards) c.shown = false;
  const sp = state.mode === 'fan' ? 0.028 : 0.01;
  stagger((c) => (c.speed = 6.5), reduceMotion ? 0 : sp, state.mode === 'deck');
  sound.ripple(N, sp, 'flick');
  touched();
  syncUI();
}
function shuffle() {
  if (state.mode === 'inspect' || state.busy) return;
  const wasFan = state.mode === 'fan';
  if (wasFan) gather();
  state.busy = 1;
  const t0 = wasFan ? 1.4 : 0;
  // split into two halves that lean apart, then riffle together in a new order
  setTimeout(() => {
    const half = N >> 1;
    for (let s = 0; s < N; s++) {
      const c = cards[state.order[s]];
      const left = s < half;
      const h = left ? s : s - half;
      c.delay = 0; c.speed = 8;
      c.tpos.set(left ? -1.75 : 1.75, 0.004 + h * CARD_T * 1.04, 0.2);
      c.tyaw = left ? 0.12 : -0.12;
    }
    state.mode = 'shuffle';
    sound.slide(0.3); sound.slide(0.25, 0.08);
    setTimeout(() => {
      const next = state.order.slice();
      for (let i = next.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [next[i], next[j]] = [next[j], next[i]]; }
      state.order = next;
      state.mode = 'deck';
      stagger((c) => (c.speed = 10), reduceMotion ? 0 : 0.014);
      sound.ripple(N, 0.014, 'flick');
      setTimeout(() => { state.busy = 0; }, 900);
      syncUI();
    }, 650);
  }, t0 * 1000);
  touched();
}

function pull(ci) {
  if (ci < 0) return;
  const c = cards[ci];
  state.inspect = ci;
  state.mode = 'inspect';
  state.spin = 0; state.spinVel = 0;
  // turn it to face us; if it's already face-up keep it so
  state.spinTarget = 0;
  c.delay = 0; c.speed = 4.2;
  loadHiRes(c);
  sound.slide(0.3); sound.snap(0.35);
  touched();
  syncUI();
}
function putBack() {
  if (state.inspect < 0) return;
  const c = cards[state.inspect];
  // settle the flip scalar near the resting orientation so it doesn't unwind
  if (tour.on) c.shown = true;
  const rest = state.faceUp || c.shown ? 0 : Math.PI;
  c.flip = rest + ((c.flip - rest) % TAU + TAU + Math.PI) % TAU - Math.PI;
  c.speed = 5;
  state.inspect = -1;
  state.mode = state.home;
  state.hover = -1;
  sound.slide(0.22);
  syncUI();
}
function navigate(dir) {
  if (state.inspect < 0) return;
  const s = slotOf(state.inspect);
  const ns = (s + dir + N) % N;
  putBack();
  const next = state.order[ns];
  setTimeout(() => pull(next), 90);
  if (tour.on) { tour.i = ns; tour.next = now() + holdFor(next) + 0.4; progress(); }
}
// ---------------------------------------------------------------------------
// The procession: every card, in new deck order, raised to the viewer and
// laid back face-up so the year fills in around the ring.
const tour = { on: false, paused: false, i: -1, next: 0 };
const holdFor = (ci) => (GILT.has(IDS[ci]) ? 3.4 : 2.4);
function progress() { $('progressBar').style.width = `${((tour.i + 1) / N) * 100}%`; }
function startTour() {
  if (tour.on) { stopTour(); return; }
  if (state.busy) return;
  if (state.inspect >= 0) putBack();
  let wait = 0.4;
  const natural = IDS.map((_, i) => i);
  const sorted = state.order.every((ci, s) => ci === s);
  if (!sorted) {
    state.order = natural;
    if (state.mode === 'fan') { stagger((c) => (c.speed = 5), reduceMotion ? 0 : 0.012); sound.ripple(N, 0.012, 'slide', 0.12); wait = 1.8; }
  }
  for (const c of cards) c.shown = false;
  if (state.mode === 'deck') { spread(); wait = 2.2; }
  tour.on = true; tour.paused = false; tour.i = -1; tour.next = now() + wait;
  progress();
  touched();
  syncUI();
}
function advanceTour() {
  tour.i++;
  if (tour.i >= N) { stopTour(); return; }
  const ci = state.order[tour.i];
  if (state.inspect >= 0) putBack();
  pull(ci);
  if (tour.i + 1 < N) loadHiRes(cards[state.order[tour.i + 1]]);
  tour.next = now() + holdFor(ci);
  progress();
}
function pauseTour(p) {
  if (!tour.on) return;
  tour.paused = p;
  if (!p) tour.next = now() + 0.6;
  syncUI();
}
function stopTour() {
  if (!tour.on) return;
  if (state.inspect >= 0) putBack();
  tour.on = false; tour.paused = false;
  syncUI();
}

function turnInspected() {
  state.spinTarget += Math.PI;
  sound.flick();
}

// ---------------------------------------------------------------------------
// High resolution faces arrive when a card is examined
const hiCache = [];
function loadHiRes(c) {
  if (c.hiRes || c.loadingHi) return;
  c.loadingHi = true;
  loader.load(`cards/${c.id}.webp`, (t) => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
    c.lowMap = c.front.material.map;
    c.front.material.map = t; c.front.material.needsUpdate = true;
    c.hiRes = t; c.loadingHi = false;
    hiCache.push(c);
    while (hiCache.length > 6) {
      const old = hiCache.shift();
      if (old.i === state.inspect) { hiCache.push(old); break; }
      old.front.material.map = old.lowMap; old.front.material.needsUpdate = true;
      old.hiRes.dispose(); old.hiRes = null;
    }
  }, undefined, () => { c.loadingHi = false; });
}

// ---------------------------------------------------------------------------
// Pointer
const pointer = { x: 0, y: 0, sx: 0, sy: 0, tx: 0, ty: 0, down: false, dx: 0, dy: 0, moved: 0, lastX: 0, lastY: 0, onCard: false };
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function hit(ev) {
  ndc.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const h = ray.intersectObjects(pick, false)[0];
  return h ? h.object.userData.card : -1;
}
canvas.addEventListener('pointerdown', (e) => {
  sound.init(); sound.ctx?.resume?.();
  pointer.down = true; pointer.moved = 0; pointer.lastX = e.clientX; pointer.lastY = e.clientY;
  pointer.onCard = state.mode === 'inspect' && hit(e) === state.inspect;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  pointer.tx = (e.clientX / innerWidth) * 2 - 1;
  pointer.ty = (e.clientY / innerHeight) * 2 - 1;
  if (pointer.down) {
    const dx = e.clientX - pointer.lastX, dy = e.clientY - pointer.lastY;
    pointer.lastX = e.clientX; pointer.lastY = e.clientY;
    pointer.moved += Math.abs(dx) + Math.abs(dy);
    if (state.mode === 'inspect') {
      if (tour.on && pointer.moved > 6) pauseTour(true);
      state.spin += dx * 0.011; state.spinVel = dx * 0.011;
    } else {
      rig.velAz = -dx * 0.0042; rig.velPolar = -dy * 0.003;
      rig.dragAz += rig.velAz; rig.dragPolar = THREE.MathUtils.clamp(rig.dragPolar + rig.velPolar, -0.45, 0.4);
    }
    canvas.style.cursor = 'grabbing';
    return;
  }
  hoverAt(e);
});
function hoverAt(e) {
  const ci = hit(e);
  if (state.mode === 'fan') {
    const s = ci >= 0 ? slotOf(ci) : -1;
    if (s !== state.hover && s >= 0) sound.flick();
    state.hover = s;
    canvas.style.cursor = s >= 0 ? 'pointer' : 'grab';
  } else if (state.mode === 'deck') {
    const on = ci >= 0;
    if (on && !state.deckHover) sound.flick();
    state.deckHover = on;
    canvas.style.cursor = on ? 'pointer' : 'grab';
  } else if (state.mode === 'inspect') {
    canvas.style.cursor = ci === state.inspect ? 'grab' : 'zoom-out';
  }
}
canvas.addEventListener('pointerup', (e) => {
  pointer.down = false;
  canvas.style.cursor = '';
  if (state.mode === 'inspect') {
    // settle a spin onto the nearest side
    const total = state.spinTarget + state.spin + state.spinVel * 8;
    state.spinTarget = Math.round(total / Math.PI) * Math.PI;
    state.spin = 0;
    if (pointer.moved < 6) {
      const ci = hit(e);
      if (ci === state.inspect) { turnInspected(); if (tour.on) pauseTour(true); }
      else if (tour.on) stopTour(); else putBack();
    }
    return;
  }
  if (pointer.moved > 6) return;
  const ci = hit(e);
  if (state.mode === 'deck') {
    if (ci >= 0) spread();
  } else if (state.mode === 'fan') {
    if (ci >= 0) pull(ci); else if (!state.busy) gather();
  }
  hoverAt(e);
});
canvas.addEventListener('pointerleave', () => { state.hover = -1; state.deckHover = false; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (state.mode === 'inspect') { navigateWheel(e.deltaY + e.deltaX); return; }
  rig.tZoom = THREE.MathUtils.clamp(rig.tZoom * (1 + e.deltaY * 0.0012), 0.62, 1.35);
}, { passive: false });
let wheelAcc = 0, wheelT = 0;
function navigateWheel(d) {
  wheelAcc += d;
  if (Math.abs(wheelAcc) > 120 && now() - wheelT > 0.5) { navigate(Math.sign(wheelAcc)); wheelAcc = 0; wheelT = now(); }
}

addEventListener('keydown', (e) => {
  sound.init();
  const k = e.key;
  if (tour.on && (k === ' ' || k === 'p' || k === 'P')) { e.preventDefault(); pauseTour(!tour.paused); return; }
  if (tour.on && (k === 'Escape' || k === 'Backspace')) { stopTour(); return; }
  if (k === 'p' || k === 'P') { startTour(); return; }
  if (k === ' ' || k === 'Enter') {
    e.preventDefault();
    if (state.mode === 'deck') spread();
    else if (state.mode === 'fan') state.hover >= 0 ? pull(state.order[state.hover]) : gather();
    else if (state.mode === 'inspect') turnInspected();
  } else if (k === 'Escape' || k === 'Backspace') {
    if (state.mode === 'inspect') putBack(); else if (state.mode === 'fan') gather();
  } else if (k === 'ArrowRight' || k === 'ArrowLeft') {
    const d = k === 'ArrowRight' ? 1 : -1;
    if (state.mode === 'inspect') navigate(d);
    else if (state.mode === 'fan') { state.hover = state.hover < 0 ? (d > 0 ? 0 : N - 1) : (state.hover + d + N) % N; sound.flick(); }
    else if (state.mode === 'deck') pull(state.order[N - 1]);
  } else if (k === 'f' || k === 'F') flipAll();
  else if (k === 's' || k === 'S') shuffle();
});

// ---------------------------------------------------------------------------
// UI
const $ = (id) => document.getElementById(id);
const dock = $('dock');
$('bSpread').onclick = () => { sound.init(); state.mode === 'deck' ? spread() : state.mode === 'fan' ? gather() : putBack(); };
$('bFlip').onclick = () => { sound.init(); flipAll(); };
$('bShuffle').onclick = () => { sound.init(); shuffle(); };
$('bSound').onclick = () => { sound.init(); sound.on = !sound.on; $('bSound').classList.toggle('active', sound.on); $('bSound').querySelectorAll('.w1,.w2').forEach((p) => (p.style.opacity = sound.on ? 1 : 0.15)); };
$('bPrev').onclick = () => navigate(-1);
$('bNext').onclick = () => navigate(1);
$('bClose').onclick = () => (tour.on ? stopTour() : putBack());
$('bTour').onclick = () => { sound.init(); startTour(); };
$('bTourCtl').onclick = () => pauseTour(!tour.paused);
function syncUI() {
  const insp = state.mode === 'inspect';
  $('bSpread').classList.toggle('active', state.home === 'fan' && !insp);
  $('bFlip').classList.toggle('active', state.faceUp);
  for (const id of ['bPrev', 'bNext', 'bClose']) $(id).classList.toggle('on', insp);
  const hideDock = insp || tour.on;
  dock.style.opacity = hideDock ? '0' : '';
  dock.style.pointerEvents = hideDock ? 'none' : '';
  $('bTour').classList.toggle('active', tour.on);
  $('tour').classList.toggle('on', tour.on);
  $('tour').classList.toggle('paused', tour.paused);
  $('bTourCtl').setAttribute('aria-label', tour.paused ? 'Resume the procession' : 'Pause the procession');
  $('progress').classList.toggle('on', tour.on);
}
function touched() {
  state.started = true;
}

// film grain
(function grain() {
  const c = document.createElement('canvas'); c.width = c.height = 180;
  const x = c.getContext('2d'); const img = x.createImageData(180, 180);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  x.putImageData(img, 0, 0);
  $('grain').style.backgroundImage = `url(${c.toDataURL()})`;
})();

// ---------------------------------------------------------------------------
function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < 0.8 ? 46 : 35;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  fitFan();
}
addEventListener('resize', resize);
resize();

// ---------------------------------------------------------------------------
// Frame
let lightUp = 0;
function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;

  // lights rise as the room opens
  lightUp = Math.min(1, lightUp + dt * 0.35);
  const ease = lightUp * lightUp * (3 - 2 * lightUp);
  const insp = state.mode === 'inspect';
  spot.intensity = THREE.MathUtils.lerp(spot.intensity, ease * (insp ? 110 : state.home === 'fan' ? 190 : 250), 1 - Math.exp(-3 * dt));
  spot.angle = THREE.MathUtils.lerp(spot.angle, state.home === 'fan' ? 0.6 : 0.3, 1 - Math.exp(-2 * dt));
  fill.intensity = ease * 0.16;
  rim.intensity = ease * 0.35;
  keyLight.intensity = THREE.MathUtils.lerp(keyLight.intensity, insp ? 9 : 0, 1 - Math.exp(-3 * dt));
  dim.material.opacity = THREE.MathUtils.lerp(dim.material.opacity, insp ? (tour.on ? 0.4 : 0.62) : 0, 1 - Math.exp(-4 * dt));
  dustMat.opacity = ease * 0.5;
  invite.material.opacity = state.started || state.mode !== 'deck' ? Math.max(0, invite.material.opacity - dt * 0.6) : ease * (0.1 + 0.08 * Math.sin(t * 1.6));
  const sc = 1 + 0.03 * Math.sin(t * 1.6); invite.scale.set(sc, sc, sc);
  invite.position.z = 0.2;

  // dust drift
  const p = dustGeo.attributes.position.array;
  for (let i = 0; i < DUST; i++) {
    p[i * 3 + 1] += dt * (0.05 + 0.03 * Math.sin(dustSeed[i] + t * 0.3));
    p[i * 3] += Math.sin(dustSeed[i] * 3 + t * 0.2) * dt * 0.04;
    if (p[i * 3 + 1] > 12) p[i * 3 + 1] = 0;
  }
  dustGeo.attributes.position.needsUpdate = true;

  // camera rig
  if (!pointer.down) {
    rig.dragAz += rig.velAz; rig.velAz *= Math.pow(0.02, dt);
    rig.dragPolar = THREE.MathUtils.clamp(rig.dragPolar + rig.velPolar, -0.45, 0.4); rig.velPolar *= Math.pow(0.02, dt);
    if (!insp && Math.abs(rig.velPolar) < 1e-4) rig.dragPolar *= Math.pow(0.5, dt);
  }
  pointer.sx += (pointer.tx - pointer.sx) * (1 - Math.exp(-4 * dt));
  pointer.sy += (pointer.ty - pointer.sy) * (1 - Math.exp(-4 * dt));
  const k = 1 - Math.exp(-rig.k * dt);
  rig.k = Math.min(2.4, rig.k + dt * 0.3);
  rig.target.lerp(rig.tTarget, k);
  rig.radius += (rig.tRadius - rig.radius) * k;
  rig.polar += (rig.tPolar - rig.polar) * k;
  rig.zoom += (rig.tZoom - rig.zoom) * (1 - Math.exp(-5 * dt));
  const sway = reduceMotion ? 0 : Math.sin(t * 0.11) * 0.07;
  const parallax = insp ? 0 : pointer.sx * 0.04;
  const az = rig.dragAz + sway + parallax;
  const pol = THREE.MathUtils.clamp(rig.polar + rig.dragPolar + (insp ? 0 : pointer.sy * 0.02), 0.12, 1.35);
  const R = rig.radius * rig.zoom;
  camera.position.set(
    rig.target.x + Math.sin(pol) * Math.sin(az) * R,
    rig.target.y + Math.cos(pol) * R,
    rig.target.z + Math.sin(pol) * Math.cos(az) * R,
  );
  camera.lookAt(rig.target);

  if (tour.on && !tour.paused && now() >= tour.next) advanceTour();

  // inspected card: spin inertia
  if (insp && !pointer.down) { state.spin += state.spinVel; state.spinVel *= Math.pow(0.001, dt); }

  if (state.mode !== 'shuffle') step(dt, t);
  else for (const c of cards) {
    const kk = 1 - Math.exp(-c.speed * dt);
    c.pos.lerp(c.tpos, kk); c.yaw += (c.tyaw - c.yaw) * kk; c.flip += (c.tflip - c.flip) * kk;
    apply(c, 0);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------------------
// Boot: fetch every face, then deal the deck onto the cloth.
(async function boot() {
  const [backMap, backMat] = await Promise.all([tex('cards/BACK.sm.webp'), tex('cards/BACK.mat.png', false)]);
  backMaterial = faceMaterial(backMap, backMat);
  IDS.forEach((id, i) => makeCard(id, i));
  // cards begin scattered in the dark above the table
  for (const c of cards) {
    c.pos.set((Math.random() - 0.5) * 6, 7 + Math.random() * 5, (Math.random() - 0.5) * 5 - 2);
    c.yaw = (Math.random() - 0.5) * 3; c.flip = Math.PI + (Math.random() - 0.5) * 1.5; c.tilt = -Math.PI / 2 + (Math.random() - 0.5);
    apply(c, 0);
  }
  const faces = await Promise.all(IDS.map((id) => Promise.all([tex(`cards/${id}.sm.webp`), GILT.has(id) ? tex(`cards/${id}.mat.png`, false) : null])));
  faces.forEach(([map, mat], i) => { cards[i].front.material = faceMaterial(map, mat); });

  $('veil').classList.add('gone');
  requestAnimationFrame(frame);
  // deal
  state.mode = 'deck'; state.home = 'deck';
  setRig('deck');
  const t0 = 0.9;
  for (let s = 0; s < N; s++) { const c = cards[state.order[s]]; c.delay = t0 + s * 0.035; c.speed = 6.5; }
  for (let s = 0; s < N; s += 3) sound.slide(0.1, t0 + s * 0.035);
  setTimeout(() => dock.classList.add('on'), 3600);
  syncUI();
})();
