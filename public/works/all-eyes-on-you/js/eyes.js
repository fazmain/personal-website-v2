// The eyes: where they sit, who they are, and how they move.
// Pure logic (no DOM). attention.js decides WHAT each eye wants to look at;
// this file decides HOW it gets there: saccades, pursuit, blinks, lids and pupils.

import { clamp, lerp, mulberry32, screenToWorld } from './geometry.js';

// Iris colours roughly in proportion to the world's population: mostly browns.
const IRIS = [
  [0.46, [0.17, 0.09, 0.05], [0.29, 0.16, 0.07]],   // dark brown
  [0.20, [0.30, 0.17, 0.08], [0.47, 0.29, 0.11]],   // brown
  [0.08, [0.27, 0.30, 0.16], [0.55, 0.36, 0.12]],   // hazel
  [0.04, [0.55, 0.36, 0.11], [0.70, 0.48, 0.15]],   // amber
  [0.05, [0.20, 0.36, 0.24], [0.48, 0.44, 0.19]],   // green
  [0.12, [0.24, 0.38, 0.58], [0.44, 0.55, 0.64]],   // blue
  [0.05, [0.37, 0.42, 0.47], [0.55, 0.57, 0.57]],   // grey
];
// Skin, after the Monk Skin Tone scale.
const SKIN = ['f6ede4', 'f3e7db', 'f7ead0', 'eadaba', 'd7bd96', 'a07e56', '825c43', '604134', '3a312a', '292420']
  .map(h => [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255));

function pickWeighted(rng, list) {
  let x = rng() * list.reduce((s, l) => s + l[0], 0);
  for (const l of list) { if ((x -= l[0]) <= 0) return l; }
  return list[list.length - 1];
}
const jitter = (rng, c, a) => c.map(v => clamp(v * (1 + (rng() - 0.5) * a), 0, 1));

export function layoutEyes(pxW, pxH, cfg, rig) {
  const rng = mulberry32(cfg.seed);
  const S = Math.min(pxW, pxH);
  const maxN = Math.round(cfg.maxEyes * cfg.density);
  const placed = [];
  const free = (x, y, r) => {
    for (const e of placed) {
      const dx = x - e.x, dy = (y - e.y) * 1.45;
      if (dx * dx + dy * dy < ((e.r + r) * 1.18) ** 2) return false;
    }
    return true;
  };
  const inFrame = (x, y, r) => x > -r * 0.4 && x < pxW + r * 0.4 && y > -r * 0.25 && y < pxH + r * 0.25;

  // The great eye, slightly off centre.
  const hero = { x: pxW * (0.5 + (rng() - 0.5) * 0.22), y: pxH * (0.5 + (rng() - 0.5) * 0.16), r: S * (0.25 + rng() * 0.03), hero: true };
  placed.push(hero);

  const rMax = S * 0.1, rMin = Math.max(S * 0.01, 6);
  const N = 26000;
  for (let i = 0; i < N && placed.length < maxN; i++) {
    const t = i / N;
    const r = rMax * Math.pow(rMin / rMax, Math.pow(t, 0.8)) * (0.9 + rng() * 0.2);
    const x = rng() * pxW, y = rng() * pxH;
    if (inFrame(x, y, r) && free(x, y, r)) placed.push({ x, y, r });
  }

  placed.sort((a, b) => a.r - b.r);   // small first: the big ones are drawn over them
  const eyes = placed.map((p, i) => makeEye(p, i, rng, rig));
  // neighbours, for the eyes that glance at each other
  for (const e of eyes) {
    e.neighbours = eyes.filter(o => o !== e)
      .map(o => [Math.hypot(o.x - e.x, o.y - e.y) / (o.r + e.r), o.i]).sort((a, b) => a[0] - b[0]).slice(0, 5).map(a => a[1]);
  }
  return eyes;
}

function makeEye(p, i, rng, rig) {
  const iris = pickWeighted(rng, IRIS);
  const w = screenToWorld(rig, p.x, p.y);
  const side = rng() < 0.5 ? -1 : 1;
  const e = {
    i, x: p.x, y: p.y, r: p.r, hero: !!p.hero,
    wx: w.x, wy: w.y,
    rot: (rng() - 0.5) * 0.24,
    side,
    aspect: 0.42 + rng() * 0.16,
    irisR: 0.41 + rng() * 0.08,
    patch: 1.25 + rng() * 0.25,
    seed: rng() * 100,
    iris1: jitter(rng, iris[1], 0.18),
    iris2: jitter(rng, iris[2], 0.18),
    skin: jitter(rng, SKIN[(rng() * SKIN.length) | 0], 0.06),
    veins: Math.pow(rng(), 2.2),
    lashes: 0.35 + rng() * 0.65,

    // personality
    latency: p.hero ? 0.32 : 0.07 + rng() * 0.3,
    pursuit: p.hero ? 3 : 4 + rng() * 6,
    blinkMean: 2.4 + rng() * 5,
    patience: rng() * 22,
    shy: !p.hero && rng() < 0.08,
    dissenter: !p.hero && rng() < 0.025,
    openScale: 0.86 + rng() * 0.18,
    pupilBase: 0.34 + rng() * 0.12,
    drowsy: rng(),

    // dynamics
    dir: { x: (rng() - 0.5) * 0.2, y: -0.1 - rng() * 0.1 },
    sacc: null, fixUntil: 0, microAt: 0, faceAt: 0, faceOff: { x: 0, y: 0.02 },
    open: 0, lower: 0, blinkT: -1, nextBlink: 0, forceBlinkAt: 0,
    pupil: 0.4, arousal: 0, alert: 0, reflect: 0,

    // set by attention.js
    mood: 'sleep', focus: null, openTarget: 0, reevalAt: 0, wakeAt: 0, surpriseUntil: 0, glanceUntil: 0,
    perc: null, pendingUntil: 0, lastFocus: null,
  };
  if (e.shy) e.dissenter = false;   // one quirk per eye
  e.nextBlink = rng() * 6000;
  e.rng = mulberry32((e.seed * 1e6) | 0);
  return e;
}

// ---------- dynamics ----------

const BLINK_CLOSE = 0.075, BLINK_HOLD = 0.035, BLINK_OPEN = 0.17;
const MAX_GAZE = 0.8;   // sin of the largest rotation

function focusPoint(e, world) {
  const f = e.focus;
  if (!f) return null;
  if (f.kind === 'track') {
    const t = world.trackById.get(f.id);
    if (!t) return e.perc;   // lost: keep looking where they were
    return { x: t.x + e.faceOff.x, y: t.y + e.faceOff.y, z: t.z };
  }
  if (f.kind === 'point') return f.p;
  if (f.kind === 'eye') { const o = world.eyes[f.j]; return o ? { x: o.wx, y: o.wy, z: 0.04 } : null; }
  if (f.kind === 'down') return { x: e.wx + (f.dx ?? 0), y: e.wy - 1.2, z: 0.7 };
  return null;
}

function startBlink(e) { if (e.blinkT < 0) e.blinkT = 0; }

export function stepEye(e, dt, now, world) {
  const rng = e.rng;

  // --- perception: a target that jumps is noticed only after the eye's reaction time
  const P = focusPoint(e, world);
  if (P) {
    if (!e.perc) e.perc = { ...P };
    if (e.focus !== e.lastFocus) { e.lastFocus = e.focus; e.pendingUntil = now + e.latency * 1000; }
    if (now >= e.pendingUntil) {
      const k = 1 - Math.exp(-dt / 0.06);
      e.perc.x += (P.x - e.perc.x) * k; e.perc.y += (P.y - e.perc.y) * k; e.perc.z += (P.z - e.perc.z) * k;
    }
  }

  // --- desired direction: from the eyeball (just behind the screen) to the target
  let want;
  if (e.perc && e.focus) {
    const dx = e.perc.x - e.wx, dy = e.perc.y - e.wy, dz = Math.max(e.perc.z + 0.02, 0.03);
    const n = Math.hypot(dx, dy, dz);
    want = { x: dx / n, y: dy / n };
  } else {
    want = { x: e.dir.x * 0.98, y: lerp(e.dir.y, -0.12, 0.02) };
  }
  const m = Math.hypot(want.x, want.y);
  if (m > MAX_GAZE) { want.x *= MAX_GAZE / m; want.y *= MAX_GAZE / m; }

  // --- face scanning: when watching a person, hop between their eyes and mouth
  if (e.focus?.kind === 'track' && now > e.faceAt) {
    const r = rng();
    e.faceOff = r < 0.4 ? { x: -0.032, y: 0.03 } : r < 0.8 ? { x: 0.032, y: 0.03 } : { x: 0, y: -0.045 };
    e.faceAt = now + 350 + rng() * 1300;
  }

  // --- saccades and smooth pursuit
  if (e.sacc) {
    const s = e.sacc, t = clamp((now - s.t0) / (s.dur * 1000), 0, 1);
    const k = t * t * (3 - 2 * t);
    e.dir.x = lerp(s.from.x, s.to.x, k); e.dir.y = lerp(s.from.y, s.to.y, k);
    if (t >= 1) { e.sacc = null; e.fixUntil = now + 120 + rng() * 260; }
  } else {
    const ex = want.x - e.dir.x, ey = want.y - e.dir.y, err = Math.hypot(ex, ey);
    if (err > 0.045 && now >= e.fixUntil) {
      const amp = Math.asin(clamp(err, 0, 1)) * 57.3;
      e.sacc = { from: { ...e.dir }, to: { ...want }, t0: now, dur: 0.022 + 0.0024 * amp };
      if (amp > 22 && rng() < 0.35) startBlink(e);   // big gaze shifts come with a blink
    } else if (err < 0.14) {
      const k = Math.min(1, e.pursuit * dt);
      e.dir.x += ex * k; e.dir.y += ey * k;
    }
    if (!e.sacc && now > e.microAt) {   // microsaccade: the eye is never perfectly still
      e.dir.x += (rng() - 0.5) * 0.012; e.dir.y += (rng() - 0.5) * 0.012;
      e.microAt = now + 300 + rng() * 900;
    }
  }

  // --- lids
  let target = e.openTarget * e.openScale;
  if (now < e.surpriseUntil) target = Math.max(target, 1.12);
  if (target > 0.05) target = clamp(target + e.dir.y * 0.32, 0.05, 1.2);   // upper lid follows the gaze
  const rate = target > e.open ? (e.open < 0.2 ? 1.6 : 5) : 3.5;
  e.open += (target - e.open) * Math.min(1, rate * dt);
  const lowerT = e.mood === 'bored' ? 0.16 : e.mood === 'shy' ? 0.12 : e.mood === 'dissent' ? 0.2 : 0.02;
  e.lower += (lowerT - e.lower) * Math.min(1, 3 * dt);

  // --- blinks
  if (e.forceBlinkAt && now >= e.forceBlinkAt) { e.forceBlinkAt = 0; e.blinkT = 0; e.arousal = Math.min(1.5, e.arousal + 0.6); }
  if (now >= e.nextBlink) {
    if (e.open > 0.15) startBlink(e);
    const mean = e.blinkMean * (e.mood === 'bored' ? 0.6 : e.mood === 'watch' ? 1.2 : 1);
    e.nextBlink = now + clamp(-Math.log(1 - rng()) * mean, 0.9, 14) * 1000;
  }
  let blink = 0;
  if (e.blinkT >= 0) {
    const t = e.blinkT;
    blink = t < BLINK_CLOSE ? t / BLINK_CLOSE : t < BLINK_CLOSE + BLINK_HOLD ? 1 : 1 - (t - BLINK_CLOSE - BLINK_HOLD) / BLINK_OPEN;
    e.blinkT += dt;
    if (e.blinkT > BLINK_CLOSE + BLINK_HOLD + BLINK_OPEN) e.blinkT = -1;
  }
  e.lid = clamp(e.open * (1 - clamp(blink, 0, 1)), 0, 1.25);

  // --- pupil: dilates with arousal, narrows for something very near, and never quite rests (hippus)
  e.arousal *= Math.exp(-dt / 2.6);
  const near = e.perc && e.focus?.kind === 'track' ? clamp(1 - e.perc.z / 1.0, 0, 1) : 0;
  const pT = e.pupilBase * (1 + 0.5 * Math.min(e.arousal, 1.2)) * (1 - 0.18 * near) * (world.dark ?? 1);
  e.pupil += (pT - e.pupil) * Math.min(1, (pT > e.pupil ? 1.2 : 3) * dt);
  e.pupilOut = clamp(e.pupil + 0.012 * Math.sin(now * 0.0011 * (1 + e.seed % 1) + e.seed), 0.18, 0.8);

  // --- alertness (how lit the skin around the eye is) and how much of the viewer it reflects
  const awake = e.mood === 'watch' || e.mood === 'shy' || e.mood === 'bored' || e.mood === 'search' || e.mood === 'glance';
  const aT = awake ? 1 : e.mood === 'sentinel' || e.mood === 'after' ? 0.6 : e.mood === 'drowsy' ? 0.3 : 0.08;
  e.alert += (aT - e.alert) * Math.min(1, 1.3 * dt);
  const rT = e.focus?.kind === 'track' ? 1 : 0.25;
  e.reflect += (rT - e.reflect) * Math.min(1, 2 * dt);
}
