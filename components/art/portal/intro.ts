// The portal into /art: the ink portrait on the cream page burns softly open
// from between the eyes, the ink drifts loose as sparks, and the sparks glide
// back into a mirrored portrait made of light before the dark art world fades
// in underneath.

import { fbm, noise3 } from './noise';
import type { Portrait } from './portrait';

export const PAPER = '#fffdf4';
const INK = '#1c2331';
const VOID = '#07070b';

// Story timeline, in seconds at speed 1.
const T = {
  drawStart: 0.1,
  drawEnd: 1.25,
  ignite: 1.35,
  voidEnd: 3.1,
  homeStart: 2.75,
  homeSpread: 0.7, // later strokes start gliding home up to this much later
  homeTime: 0.95,
  neon: 3.7,
  arrive: 4.55,
  fadeStart: 4.65,
  fadeEnd: 5.7,
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const TAU = Math.PI * 2;

// Soft spark palette: warm candlelight -> amber -> lavender -> pale cyan.
// Particles carry a "temperature" in [0, 1] that indexes this ramp.
const RAMP: [number, number, number][] = [
  [255, 226, 190],
  [255, 172, 112],
  [222, 160, 210],
  [160, 214, 250],
  [226, 244, 255],
];
const BUCKETS = 32;
const BUCKET_COLORS = Array.from({ length: BUCKETS }, (_, i) => {
  const x = (i / (BUCKETS - 1)) * (RAMP.length - 1);
  const j = Math.min(RAMP.length - 2, Math.floor(x));
  const f = x - j;
  const [r, g, b] = RAMP[j].map((c, k) => Math.round(c + (RAMP[j + 1][k] - c) * f));
  return `rgb(${r},${g},${b})`;
});

export interface IntroOptions {
  canvas: HTMLCanvasElement;
  portrait: Portrait | null;
  /** 1 = full story; higher plays faster (used for repeat visits). */
  speed: number;
  /** Called when the art page underneath should start appearing. */
  onReveal: () => void;
  /** Called once the canvas has fully faded out. */
  onDone: () => void;
}

export function playIntro(o: IntroOptions) {
  const ctx = o.canvas.getContext('2d');
  if (!ctx) {
    o.onReveal();
    o.onDone();
    return { skip() {}, destroy() {} };
  }

  const portrait = o.portrait;
  const small = window.innerWidth < 640;
  const NV = small ? 110 : 160;

  // ---- layout ---------------------------------------------------------------
  let W = 0, H = 0, dpr = 1;
  let k = 1, ox = 0, oy = 0, cx = 0, cy = 0, rMax = 0;

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    o.canvas.width = Math.round(W * dpr);
    o.canvas.height = Math.round(H * dpr);
    if (portrait) {
      k = Math.min((H * 0.56) / portrait.height, (W * 0.64) / portrait.width);
      ox = W / 2 - (portrait.width * k) / 2;
      oy = H * 0.48 - (portrait.height * k) / 2;
      cx = W / 2;
      cy = oy + portrait.height * k * 0.55; // between the eyes
    } else {
      cx = W / 2;
      cy = H * 0.48;
    }
    rMax = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy)) * 1.3;
  }
  layout();

  // ---- particles --------------------------------------------------------------
  const pts = portrait?.points ?? [];
  const N = pts.length;
  const px = new Float32Array(N), py = new Float32Array(N);
  const vx = new Float32Array(N), vy = new Float32Array(N);
  const released = new Float32Array(N).fill(-1);
  const warm = new Uint8Array(N);
  const drift = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    warm[i] = Math.random() < 0.12 ? 1 : 0;
    drift[i] = 30 + Math.random() * 110;
  }
  const homeX = (i: number) => ox + pts[i].x * k;
  const homeY = (i: number) => oy + pts[i].y * k;
  const bucketLists = Array.from({ length: BUCKETS }, () => new Int32Array(N));
  const bucketSizes = new Int32Array(BUCKETS);
  const rx = new Float32Array(N), ry = new Float32Array(N);

  // ---- embers -----------------------------------------------------------------
  const MAX_EMBERS = small ? 160 : 320;
  const ex = new Float32Array(MAX_EMBERS), ey = new Float32Array(MAX_EMBERS);
  const evx = new Float32Array(MAX_EMBERS), evy = new Float32Array(MAX_EMBERS);
  const elife = new Float32Array(MAX_EMBERS), emax = new Float32Array(MAX_EMBERS);
  let emberCursor = 0;

  // ---- the burning edge ---------------------------------------------------------
  const verts = new Float32Array(NV);
  let radius = 0;

  function updateEdge(t: number) {
    const p = clamp01((t - T.ignite) / (T.voidEnd - T.ignite));
    // Slow to catch, then a long, even bloom outward.
    radius = Math.pow(easeInOutCubic(p), 1.15) * rMax;
    const amp = 0.14 * (1 - p) + 0.05;
    for (let j = 0; j < NV; j++) {
      const a = -Math.PI + (j / NV) * TAU;
      const n = fbm(Math.cos(a) * 1.4 + 3.1, Math.sin(a) * 1.4 + 7.7, t * 0.45);
      verts[j] = Math.max(0, radius * (1 + amp * (n - 0.5) * 2));
    }
  }
  const edgeAt = (dx: number, dy: number) => verts[Math.floor(((Math.atan2(dy, dx) + Math.PI) / TAU) * NV) % NV];

  function edgePath() {
    for (let j = 0; j <= NV; j++) {
      const a = -Math.PI + ((j % NV) / NV) * TAU;
      const r = verts[j % NV];
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (j === 0) ctx!.moveTo(x, y);
      else ctx!.lineTo(x, y);
    }
    ctx!.closePath();
  }

  // ---- frame ----------------------------------------------------------------------
  let start = -1;
  let last = 0;
  let raf = 0;
  let skipAt = -1;
  let skipFrom = 1;
  let revealed = false;
  let finished = false;

  const reveal = () => {
    if (!revealed) {
      revealed = true;
      o.onReveal();
    }
  };
  const finish = () => {
    if (!finished) {
      finished = true;
      cancelAnimationFrame(raf);
      reveal();
      o.onDone();
    }
  };

  function frame(now: number) {
    if (start < 0) {
      start = now;
      last = now;
    }
    const dt = Math.min((now - last) / 1000, 1 / 30) * o.speed;
    last = now;
    const t = ((now - start) / 1000) * o.speed;

    // Fade-out: either the natural ending or a skip.
    let opacity = 1 - smooth(T.fadeStart, T.fadeEnd, t);
    if (skipAt >= 0) opacity = Math.min(opacity, skipFrom * (1 - smooth(0, 500, now - skipAt)));
    o.canvas.style.opacity = String(opacity);
    if (t >= T.arrive + 0.2) reveal();
    if (opacity <= 0.001 && (t > T.fadeStart || skipAt >= 0)) return finish();

    updateEdge(t);
    const covered = radius >= rMax * 0.999;

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.globalCompositeOperation = 'source-over';
    ctx!.globalAlpha = 1;
    ctx!.fillStyle = VOID;
    ctx!.fillRect(0, 0, W, H);

    // -- sparks ----------------------------------------------------------------
    const leave = easeOutCubic((t - T.arrive) / 1.4); // the gentle exhale outward
    bucketSizes.fill(0);
    for (let i = 0; i < N; i++) {
      if (released[i] < 0) {
        if (radius <= 0) continue;
        const hx = homeX(i), hy = homeY(i);
        const dx = hx - cx, dy = hy - cy;
        if (Math.hypot(dx, dy) >= edgeAt(dx, dy)) continue;
        released[i] = t;
        px[i] = hx;
        py[i] = hy;
        const r = Math.hypot(dx, dy) || 1;
        const lift = 12 + Math.random() * 50;
        vx[i] = (dx / r) * lift + (-dy / r) * Math.random() * 40;
        vy[i] = (dy / r) * lift + (dx / r) * Math.random() * 40 - 10;
      }

      const homeAt = T.homeStart + pts[i].order * T.homeSpread;
      const h = easeInOutCubic(clamp01((t - homeAt) / T.homeTime));

      // A slow drift around the opening, fading out as the spark heads home.
      if (h < 1) {
        const dx = px[i] - cx, dy = py[i] - cy;
        const r = Math.hypot(dx, dy) || 1;
        const swirl = 120 / (1 + r / 320);
        const ang = noise3(px[i] * 0.003, py[i] * 0.003, t * 0.3) * TAU * 2;
        const ax = (-dy / r) * swirl + Math.cos(ang) * 60 - dx * 0.12;
        const ay = (dx / r) * swirl + Math.sin(ang) * 60 - dy * 0.12;
        vx[i] = (vx[i] + ax * dt) * Math.pow(0.5, dt);
        vy[i] = (vy[i] + ay * dt) * Math.pow(0.5, dt);
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;
      }

      // Rendered position glides from the drift to the mirrored portrait (the
      // other side of the glass), then breathes out on arrival. No springs, so
      // nothing overshoots.
      const tx = W - homeX(i), ty = homeY(i);
      let x = px[i] + (tx - px[i]) * h;
      let y = py[i] + (ty - py[i]) * h;
      if (leave > 0) {
        const dx = tx - cx, dy = ty - cy, r = Math.hypot(dx, dy) || 1;
        x += (dx / r) * drift[i] * leave;
        y += (dy / r) * drift[i] * leave;
      }
      rx[i] = x;
      ry[i] = y;

      const age = t - released[i];
      const temp = Math.min(1, age / 1.2) * 0.3 + h * (warm[i] ? 0.12 : 0.7);
      const b = Math.min(BUCKETS - 1, Math.round(temp * (BUCKETS - 1)));
      bucketLists[b][bucketSizes[b]++] = i;
    }

    const sparkAlpha = 1 - smooth(T.arrive, T.arrive + 1.2, t);
    if (sparkAlpha > 0 && N > 0) {
      ctx!.globalCompositeOperation = 'lighter';
      const size = small ? 1.3 : 1.5;
      for (let b = 0; b < BUCKETS; b++) {
        const n = bucketSizes[b];
        if (!n) continue;
        ctx!.fillStyle = BUCKET_COLORS[b];
        ctx!.globalAlpha = 0.6 * sparkAlpha;
        for (let j = 0; j < n; j++) {
          const i = bucketLists[b][j];
          ctx!.fillRect(rx[i] - size / 2, ry[i] - size / 2, size, size);
        }
        ctx!.globalAlpha = 0.05 * sparkAlpha;
        for (let j = 0; j < n; j += 2) {
          const i = bucketLists[b][j];
          ctx!.fillRect(rx[i] - 3.5, ry[i] - 3.5, 7, 7);
        }
      }
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = 'source-over';
    }

    // -- the mirrored portrait in light ----------------------------------------------
    const neon = smooth(T.neon, T.neon + 0.8, t) * (1 - smooth(T.arrive, T.arrive + 0.9, t));
    if (portrait && neon > 0) {
      ctx!.save();
      ctx!.globalCompositeOperation = 'lighter';
      ctx!.setTransform(-dpr * k, 0, 0, dpr * k, dpr * (W - ox), dpr * oy);
      ctx!.lineCap = 'round';
      ctx!.lineJoin = 'round';
      const passes: [number, string][] = [
        [4.5, `rgba(120,200,255,${0.05 * neon})`],
        [2.2, `rgba(150,222,255,${0.16 * neon})`],
        [0.8, `rgba(228,246,255,${0.6 * neon})`],
      ];
      for (const [mult, style] of passes) {
        ctx!.strokeStyle = style;
        for (const s of portrait.strokes) {
          ctx!.lineWidth = s.width * mult;
          ctx!.stroke(s.path);
        }
      }
      ctx!.restore();
    }

    // -- the paper that hasn't burned yet -------------------------------------------------
    if (!covered) {
      ctx!.save();
      ctx!.beginPath();
      ctx!.rect(0, 0, W, H);
      if (radius > 0) edgePath();
      ctx!.clip('evenodd');
      ctx!.fillStyle = PAPER;
      ctx!.fillRect(0, 0, W, H);

      if (portrait) {
        ctx!.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
        ctx!.strokeStyle = INK;
        ctx!.lineCap = 'round';
        ctx!.lineJoin = 'round';
        const n = portrait.strokes.length;
        portrait.strokes.forEach((s, i) => {
          const p = clamp01((t - T.drawStart - (i / n) * 0.35) / (T.drawEnd - T.drawStart - 0.35));
          if (p <= 0) return;
          const e = easeInOutCubic(p);
          if (e < 1) {
            ctx!.setLineDash([s.length, s.length]);
            ctx!.lineDashOffset = s.length * (1 - e);
          } else {
            ctx!.setLineDash([]);
          }
          ctx!.lineWidth = s.width;
          ctx!.stroke(s.path);
        });
        ctx!.setLineDash([]);
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // A soft, blurred scorch on the paper just outside the opening.
      if (radius > 0) {
        ctx!.beginPath();
        edgePath();
        ctx!.shadowColor = 'rgba(196,120,56,0.7)';
        ctx!.shadowBlur = 30 * dpr;
        ctx!.lineWidth = 5;
        ctx!.strokeStyle = 'rgba(196,120,56,0.4)';
        ctx!.stroke();
      }
      ctx!.restore();
    }

    // -- the glowing edge ------------------------------------------------------------------
    if (radius > 0 && !covered) {
      ctx!.save();
      ctx!.beginPath();
      edgePath();
      ctx!.globalCompositeOperation = 'lighter';
      // One genuinely blurred glow (no stacked bands), then a fine bright core.
      ctx!.shadowColor = 'rgba(255,140,64,1)';
      ctx!.shadowBlur = 26 * dpr;
      ctx!.lineWidth = 4;
      ctx!.strokeStyle = 'rgba(255,186,120,0.6)';
      ctx!.stroke();
      ctx!.shadowBlur = 0;
      ctx!.lineWidth = 1.2;
      ctx!.strokeStyle = 'rgba(255,236,208,0.5)';
      ctx!.stroke();
      ctx!.restore();

      // A few slow embers lifting off the edge.
      const spawn = Math.floor((small ? 45 : 90) * dt + Math.random());
      for (let s = 0; s < spawn; s++) {
        const j = Math.floor(Math.random() * NV);
        const a = -Math.PI + (j / NV) * TAU;
        const r = verts[j];
        const m = emberCursor++ % MAX_EMBERS;
        ex[m] = cx + Math.cos(a) * r;
        ey[m] = cy + Math.sin(a) * r;
        const sp = 15 + Math.random() * 70;
        evx[m] = Math.cos(a) * sp + (Math.random() - 0.5) * 20;
        evy[m] = Math.sin(a) * sp + (Math.random() - 0.5) * 20;
        emax[m] = elife[m] = 1 + Math.random() * 1.4;
      }
    }

    ctx!.globalCompositeOperation = 'lighter';
    for (let m = 0; m < MAX_EMBERS; m++) {
      if (elife[m] <= 0) continue;
      elife[m] -= dt;
      evx[m] *= Math.pow(0.6, dt);
      evy[m] = evy[m] * Math.pow(0.6, dt) - 18 * dt;
      ex[m] += evx[m] * dt;
      ey[m] += evy[m] * dt;
      const f = Math.max(0, elife[m] / emax[m]);
      const fade = f * f * (3 - 2 * f);
      ctx!.globalAlpha = fade * 0.7;
      ctx!.fillStyle = `rgb(255,${Math.round(130 + 100 * f)},${Math.round(70 + 110 * f)})`;
      const s = 0.8 + f * 1.4;
      ctx!.fillRect(ex[m] - s / 2, ey[m] - s / 2, s, s);
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = 'source-over';

    raf = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', layout);
  raf = requestAnimationFrame(frame);

  return {
    skip() {
      if (skipAt < 0 && !finished) {
        skipAt = performance.now();
        skipFrom = parseFloat(o.canvas.style.opacity || '1');
        reveal();
      }
    },
    destroy() {
      finished = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', layout);
    },
  };
}
