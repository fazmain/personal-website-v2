// The portal into /art: the cream page and ink portrait burn away from between
// the eyes, the ink turns into sparks, and the sparks redraw a mirrored portrait
// in light before the dark art world fades in underneath.

import { fbm, noise3 } from './noise';
import type { Portrait } from './portrait';

export const PAPER = '#fffdf4';
const INK = '#1c2331';
const VOID = '#07070b';

// Story timeline, in seconds at speed 1.
const T = {
  drawStart: 0.15,
  drawEnd: 1.05,
  textIn: 0.45,
  trembleStart: 0.95,
  ignite: 1.4,
  voidEnd: 2.8,
  homeStart: 2.6,
  neon: 3.35,
  arrive: 4.1,
  fadeStart: 4.3,
  fadeEnd: 5.05,
};

const GREETING = 'Hello, this is Faiaz.';
const OTHER_GREETING = 'hello, this is also faiaz.';
const GLYPHS = '▓▒░<>/\\|_-=+*#01{}[]';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const TAU = Math.PI * 2;

// Spark colour runs white-hot -> ember -> electric cyan; particles carry a
// "temperature" in [0, 1] that indexes this ramp.
const RAMP: [number, number, number][] = [
  [255, 244, 222],
  [255, 176, 92],
  [255, 92, 44],
  [196, 120, 210],
  [120, 228, 255],
  [214, 250, 255],
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
  serif: string;
  mono: string;
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
  let k = 1, ox = 0, oy = 0, cx = 0, cy = 0, rMax = 0, textY = 0, fontSize = 24;

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    o.canvas.width = Math.round(W * dpr);
    o.canvas.height = Math.round(H * dpr);
    fontSize = Math.min(34, Math.max(20, W * 0.028));
    if (portrait) {
      k = Math.min((H * 0.5) / portrait.height, (W * 0.62) / portrait.width);
      ox = W / 2 - (portrait.width * k) / 2;
      oy = H * 0.42 - (portrait.height * k) / 2;
      cx = W / 2;
      cy = oy + portrait.height * k * 0.55; // between the eyes
      textY = oy + portrait.height * k + fontSize * 1.7;
    } else {
      cx = W / 2;
      cy = H * 0.45;
      textY = H * 0.62;
    }
    rMax = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy)) * 1.4;
  }
  layout();

  // ---- particles --------------------------------------------------------------
  const pts = portrait?.points ?? [];
  const N = pts.length;
  const px = new Float32Array(N), py = new Float32Array(N);
  const vx = new Float32Array(N), vy = new Float32Array(N);
  const released = new Float32Array(N).fill(-1);
  const spark = new Uint8Array(N);
  for (let i = 0; i < N; i++) spark[i] = Math.random() < 0.12 ? 1 : 0;
  const homeX = (i: number) => ox + pts[i].x * k;
  const homeY = (i: number) => oy + pts[i].y * k;
  const bucketLists = Array.from({ length: BUCKETS }, () => new Int32Array(N));
  const bucketSizes = new Int32Array(BUCKETS);
  let scattered = false;

  // ---- embers -----------------------------------------------------------------
  const MAX_EMBERS = small ? 350 : 700;
  const ex = new Float32Array(MAX_EMBERS), ey = new Float32Array(MAX_EMBERS);
  const evx = new Float32Array(MAX_EMBERS), evy = new Float32Array(MAX_EMBERS);
  const elife = new Float32Array(MAX_EMBERS), emax = new Float32Array(MAX_EMBERS);
  let emberCursor = 0;

  // ---- the burning edge ---------------------------------------------------------
  const verts = new Float32Array(NV);
  let radius = 0;

  function updateEdge(t: number) {
    const p = clamp01((t - T.ignite) / (T.voidEnd - T.ignite));
    radius = Math.pow(p, 2.3) * rMax;
    const amp = 0.3 * (1 - p) + 0.1;
    for (let j = 0; j < NV; j++) {
      const a = -Math.PI + (j / NV) * TAU;
      const c = Math.cos(a), s = Math.sin(a);
      const n = fbm(c * 1.7 + 3.1, s * 1.7 + 7.7, t * 0.9);
      const fine = noise3(c * 9 + 1, s * 9 + 2, t * 3) - 0.5;
      verts[j] = Math.max(0, radius * (1 + amp * (n - 0.5) * 2) + fine * radius * 0.05);
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

  // ---- text ---------------------------------------------------------------------
  let invertedAt = -1;
  let scrambleSeed = '';
  let scrambleTick = -1;

  function scrambled(t: number) {
    const tick = Math.floor(t * 18);
    if (tick !== scrambleTick) {
      scrambleTick = tick;
      scrambleSeed = Array.from(OTHER_GREETING, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');
    }
    return Array.from(OTHER_GREETING, (ch, i) => {
      if (ch === ' ') return ' ';
      return t - invertedAt > 0.35 + i * 0.04 ? ch : scrambleSeed[i];
    }).join('');
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
    if (skipAt >= 0) opacity = Math.min(opacity, skipFrom * (1 - clamp01((now - skipAt) / 350)));
    o.canvas.style.opacity = String(opacity);
    if (t >= T.arrive + 0.15) reveal();
    if (opacity <= 0.001 && (t > T.fadeStart || skipAt >= 0)) return finish();

    updateEdge(t);
    const covered = radius >= rMax * 0.999;

    // A short shudder when the paper ignites.
    let sx = 0, sy = 0;
    if (t > T.ignite && t < T.ignite + 0.4) {
      const a = (1 - (t - T.ignite) / 0.4) * 3.5;
      sx = (Math.random() - 0.5) * a;
      sy = (Math.random() - 0.5) * a;
    }
    const tremble = smooth(T.trembleStart, T.ignite + 0.2, t) * 1.8;

    ctx!.setTransform(dpr, 0, 0, dpr, dpr * sx, dpr * sy);
    ctx!.globalCompositeOperation = 'source-over';
    ctx!.globalAlpha = 1;
    ctx!.fillStyle = VOID;
    ctx!.fillRect(-20, -20, W + 40, H + 40);

    // -- sparks ----------------------------------------------------------------
    if (t >= T.arrive && !scattered) {
      scattered = true;
      for (let i = 0; i < N; i++) {
        const dx = px[i] - cx, dy = py[i] - cy, r = Math.hypot(dx, dy) || 1;
        const kick = 260 + Math.random() * 520;
        vx[i] += (dx / r) * kick;
        vy[i] += (dy / r) * kick;
      }
    }

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
        const burst = 40 + Math.random() * 170;
        vx[i] = (dx / r) * burst + (-dy / r) * Math.random() * 90;
        vy[i] = (dy / r) * burst + (dx / r) * Math.random() * 90;
      }

      const age = t - released[i];
      const homeAt = T.homeStart + pts[i].order * 0.6;
      const h = smooth(homeAt, homeAt + 0.45, t);
      const dx = px[i] - cx, dy = py[i] - cy;
      const r = Math.hypot(dx, dy) || 1;
      let ax = 0, ay = 0;

      if (scattered) {
        vx[i] *= Math.pow(0.35, dt);
        vy[i] *= Math.pow(0.35, dt);
      } else {
        if (h < 1) {
          // Swirl around the opening plus a slowly turning noise flow.
          const swirl = (260 / (1 + r / 260)) * (1 - h);
          ax += (-dy / r) * swirl;
          ay += (dx / r) * swirl;
          const ang = noise3(px[i] * 0.0035, py[i] * 0.0035, t * 0.5) * TAU * 2;
          ax += Math.cos(ang) * 150 * (1 - h) - dx * 0.22 * (1 - h);
          ay += Math.sin(ang) * 150 * (1 - h) - dy * 0.22 * (1 - h);
        }
        if (h > 0) {
          // Spring into the mirrored portrait: the other side of the glass.
          const tx = W - homeX(i), ty = homeY(i);
          ax += (tx - px[i]) * 150 * h - vx[i] * 15 * h;
          ay += (ty - py[i]) * 150 * h - vy[i] * 15 * h;
        }
        vx[i] = (vx[i] + ax * dt) * Math.pow(0.6, dt);
        vy[i] = (vy[i] + ay * dt) * Math.pow(0.6, dt);
      }
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;

      // white-hot -> ember while burning; -> cyan once home (sparks stay warm).
      const heat = Math.min(1, age / 0.7) * 0.4;
      const temp = heat + h * (spark[i] ? 0.15 : 0.6);
      const b = Math.min(BUCKETS - 1, Math.round(temp * (BUCKETS - 1)));
      bucketLists[b][bucketSizes[b]++] = i;
    }

    const sparkAlpha = 1 - smooth(T.arrive, T.arrive + 0.8, t);
    if (sparkAlpha > 0) {
      ctx!.globalCompositeOperation = 'lighter';
      const size = small ? 1.4 : 1.7;
      for (let b = 0; b < BUCKETS; b++) {
        const n = bucketSizes[b];
        if (!n) continue;
        ctx!.fillStyle = BUCKET_COLORS[b];
        ctx!.globalAlpha = 0.85 * sparkAlpha;
        for (let j = 0; j < n; j++) {
          const i = bucketLists[b][j];
          ctx!.fillRect(px[i] - size / 2, py[i] - size / 2, size, size);
        }
        // a soft halo on a third of them
        ctx!.globalAlpha = 0.09 * sparkAlpha;
        for (let j = 0; j < n; j += 3) {
          const i = bucketLists[b][j];
          ctx!.fillRect(px[i] - 3, py[i] - 3, 6, 6);
        }
      }
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = 'source-over';
    }

    // -- the mirrored portrait in light ----------------------------------------------
    const neon = smooth(T.neon, T.neon + 0.5, t) * (1 - smooth(T.arrive, T.arrive + 0.55, t));
    if (portrait && neon > 0) {
      ctx!.save();
      ctx!.globalCompositeOperation = 'lighter';
      ctx!.setTransform(-dpr * k, 0, 0, dpr * k, dpr * (W - ox + sx), dpr * (oy + sy));
      ctx!.lineCap = 'round';
      ctx!.lineJoin = 'round';
      const passes: [number, string][] = [
        [3.2, `rgba(70,190,255,${0.1 * neon})`],
        [1.5, `rgba(120,228,255,${0.35 * neon})`],
        [0.6, `rgba(235,252,255,${0.85 * neon})`],
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
      ctx!.rect(-20, -20, W + 40, H + 40);
      if (radius > 0) edgePath();
      ctx!.clip('evenodd');
      ctx!.globalCompositeOperation = 'source-over';
      ctx!.fillStyle = PAPER;
      ctx!.fillRect(-20, -20, W + 40, H + 40);

      if (portrait) {
        ctx!.strokeStyle = INK;
        ctx!.lineCap = 'round';
        ctx!.lineJoin = 'round';
        const n = portrait.strokes.length;
        portrait.strokes.forEach((s, i) => {
          const jx = (Math.random() - 0.5) * tremble, jy = (Math.random() - 0.5) * tremble;
          ctx!.setTransform(dpr * k, 0, 0, dpr * k, dpr * (ox + sx + jx), dpr * (oy + sy + jy));
          const p = clamp01((t - T.drawStart - (i / n) * 0.3) / (T.drawEnd - T.drawStart - 0.3));
          if (p <= 0) return;
          const e = easeOutCubic(p);
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
      }

      ctx!.setTransform(dpr, 0, 0, dpr, dpr * sx, dpr * sy);
      ctx!.globalAlpha = smooth(T.textIn, T.textIn + 0.5, t);
      ctx!.fillStyle = INK;
      ctx!.font = `${fontSize}px ${o.serif}`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(GREETING, W / 2 + (Math.random() - 0.5) * tremble, textY);
      ctx!.globalAlpha = 1;
      ctx!.restore();
    }

    // -- the greeting on the other side ----------------------------------------------------
    if (radius > 0) {
      if (invertedAt < 0 && textY - cy < edgeAt(0, textY - cy)) invertedAt = t;
      const textAlpha = 1 - smooth(T.arrive, T.arrive + 0.5, t);
      if (invertedAt >= 0 && textAlpha > 0) {
        ctx!.save();
        if (!covered) {
          ctx!.beginPath();
          edgePath();
          ctx!.clip();
        }
        ctx!.globalCompositeOperation = 'source-over';
        ctx!.globalAlpha = textAlpha;
        ctx!.font = `${fontSize * 0.78}px ${o.mono}`;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.shadowColor = 'rgba(120,228,255,0.8)';
        ctx!.shadowBlur = 10;
        ctx!.fillStyle = '#ece6da';
        ctx!.fillText(scrambled(t), W / 2, textY);
        ctx!.restore();
      }
    }

    // -- the burning edge ----------------------------------------------------------------
    if (radius > 0 && !covered) {
      ctx!.save();
      ctx!.beginPath();
      edgePath();
      ctx!.globalCompositeOperation = 'source-over';
      ctx!.strokeStyle = 'rgba(70,32,12,0.3)';
      ctx!.lineWidth = 34;
      ctx!.stroke();
      ctx!.globalCompositeOperation = 'lighter';
      const glow: [number, string][] = [
        [24, 'rgba(255,72,16,0.2)'],
        [9, 'rgba(255,128,48,0.55)'],
        [2.5, 'rgba(255,228,176,0.95)'],
      ];
      for (const [w, style] of glow) {
        ctx!.lineWidth = w;
        ctx!.strokeStyle = style;
        ctx!.stroke();
      }
      ctx!.restore();

      // Embers thrown off the edge.
      const spawn = Math.floor((small ? 140 : 280) * dt + Math.random());
      for (let s = 0; s < spawn; s++) {
        const j = Math.floor(Math.random() * NV);
        const a = -Math.PI + (j / NV) * TAU;
        const r = verts[j];
        const m = emberCursor++ % MAX_EMBERS;
        ex[m] = cx + Math.cos(a) * r;
        ey[m] = cy + Math.sin(a) * r;
        const sp = 60 + Math.random() * 240;
        evx[m] = Math.cos(a) * sp + (Math.random() - 0.5) * 80;
        evy[m] = Math.sin(a) * sp + (Math.random() - 0.5) * 80 - 40;
        emax[m] = elife[m] = 0.5 + Math.random() * 0.9;
      }
    }

    ctx!.globalCompositeOperation = 'lighter';
    for (let m = 0; m < MAX_EMBERS; m++) {
      if (elife[m] <= 0) continue;
      elife[m] -= dt;
      evx[m] *= Math.pow(0.5, dt);
      evy[m] = evy[m] * Math.pow(0.5, dt) - 45 * dt;
      ex[m] += evx[m] * dt;
      ey[m] += evy[m] * dt;
      const f = Math.max(0, elife[m] / emax[m]);
      ctx!.globalAlpha = f;
      ctx!.fillStyle = f > 0.6 ? '#ffe6b4' : f > 0.3 ? '#ff8c3c' : '#c83c1e';
      const s = 0.6 + f * 2.2;
      ctx!.fillRect(ex[m] - s / 2, ey[m] - s / 2, s, s);
    }

    // -- arrival shockwave -----------------------------------------------------------------
    if (t >= T.arrive) {
      const p = clamp01((t - T.arrive) / 0.9);
      if (p < 1) {
        ctx!.globalAlpha = 1;
        ctx!.beginPath();
        ctx!.arc(cx, cy, easeOutCubic(p) * rMax * 0.75, 0, TAU);
        ctx!.lineWidth = (1 - p) * 7 + 0.5;
        ctx!.strokeStyle = `rgba(180,240,255,${(1 - p) * 0.85})`;
        ctx!.stroke();
        if (p < 0.15) {
          ctx!.fillStyle = `rgba(200,245,255,${(0.15 - p) * 0.6})`;
          ctx!.fillRect(-20, -20, W + 40, H + 40);
        }
      }
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
