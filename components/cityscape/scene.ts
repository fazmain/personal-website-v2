// A dithered, pixel-art SF × NYC skyline at sunset, drawn on a <canvas>.
// Kept deliberately soft: muted colours close to the page background, so the
// footer reads as part of the page rather than a picture placed on it.
//
// Pipeline for each frame:
//   1. Paint the soft stuff (sky, sun, haze, back fog, water, reflection) with
//      ordinary canvas gradients onto `bg`.
//   2. Ordered-dither that to a small palette (4×4 Bayer), which turns every
//      gradient into the dot pattern.
//   3. Stamp the crisp silhouettes (bridge, hills, buildings), built once per
//      resize from whole pixels, so they never get dithered.
//   4. Add a few live pixels (twinkling windows, beacons, windows around the
//      cursor) and a dithered fog bank rolling through the Gate.
//
// All coordinates are in art pixels; the canvas is scaled up with
// `image-rendering: pixelated`.

type RGB = readonly [number, number, number];

const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

// Roles, not hues: tweak these to restyle the whole scene.
export const COLORS = {
  page: '#fffdf4', // = page background; the sky starts and the water ends here
  paper: '#f8f0e2',
  sand: '#f0e2cc',
  blush: '#e8cfb8',
  clay: '#dcb79d',
  haze: '#ddd3cc', // far ridge, back row of buildings
  mist: '#cbbfb8', // hills
  city: '#b3a6a1', // landmarks and front row: a warm grey, kin to the bridge
  bridge: '#bd8a76', // a muted International Orange
  bridgeShade: '#a97a69',
  window: '#f6e8c6',
  beacon: '#cf7a68',
} as const;

// Colours the soft layers are dithered to.
const DITHER_PALETTE = ['page', 'sand', 'blush', 'clay', 'haze', 'mist', 'city'] as const;
const SPREAD = 40;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => ((v + 0.5) / 16 - 0.5) * SPREAD);

export const ART_HEIGHT = 128;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Nearest-palette lookup on 5-bit RGB, built once.
let LUT: Uint8Array | null = null;
const PAL: RGB[] = DITHER_PALETTE.map(k => hex(COLORS[k]));
const PAGE = hex(COLORS.page);
function lut() {
  if (LUT) return LUT;
  LUT = new Uint8Array(32 * 32 * 32);
  for (let r = 0; r < 32; r++)
    for (let g = 0; g < 32; g++)
      for (let b = 0; b < 32; b++) {
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < PAL.length; i++) {
          const [pr, pg, pb] = PAL[i];
          const d = (r * 8 + 4 - pr) ** 2 + (g * 8 + 4 - pg) ** 2 + (b * 8 + 4 - pb) ** 2;
          if (d < bestD) { bestD = d; best = i; }
        }
        LUT[(r << 10) | (g << 5) | b] = best;
      }
  return LUT;
}

type Light = { x: number; y: number; phase: number };

export function createCityscape(canvas: HTMLCanvasElement) {
  const out = canvas.getContext('2d')!;
  const bg = document.createElement('canvas');
  const bgx = bg.getContext('2d', { willReadFrequently: true })!;
  const fg = document.createElement('canvas');
  const fgx = fg.getContext('2d', { willReadFrequently: true })!;

  const H = ART_HEIGHT;
  const HZ = H - 30; // horizon / waterline
  const B = HZ - 2; // street level
  const DECK = HZ - 12;
  const TOP = HZ - 60; // bridge tower tops

  let W = 0;
  let fgData = new Uint8ClampedArray(0);
  let img: ImageData | null = null;
  let towerA = 0, towerB = 0, anchorR = 0;
  let twinkles: Light[] = [];
  let beacons: Light[] = [];
  let windows: { x: number; y: number; h: number }[] = []; // every window slot, for the cursor glow
  let pointer: { x: number; y: number } | null = null;

  const WINDOW = hex(COLORS.window);
  const BEACON = hex(COLORS.beacon);
  const FOG = hex(COLORS.page);

  // ---------- silhouettes (crisp, built once per size) ----------

  function rect(x: number, y: number, w: number, h: number, c: string) {
    fgx.fillStyle = c;
    fgx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  const px = (x: number, y: number, c: string) => rect(x, y, 1, 1, c);

  function build() {
    const rng = mulberry32(1906);
    fgx.clearRect(0, 0, W, H);
    twinkles = []; beacons = []; windows = [];

    const addWindows = (l: number, r: number, y0: number, y1: number, p: number) => {
      for (let y = y0 + 2; y < y1 - 1; y += 3)
        for (let x = l + 1; x < r; x += 2) {
          const h = rng();
          windows.push({ x, y, h });
          if (h >= p) continue;
          if (rng() < 0.3) twinkles.push({ x, y, phase: rng() * 10 });
          else px(x, y, COLORS.window);
        }
    };

    // Rows of [y, xLeft, xRight].
    type Rows = [number, number, number][];
    const fill = (rows: Rows, c: string = COLORS.city) => { for (const [y, l, r] of rows) rect(l, y, r - l + 1, 1, c); };
    const span = (y0: number, y1: number, half: (y: number) => number, cx: number): Rows => {
      const rows: Rows = [];
      for (let y = y0; y < y1; y++) { const h = half(y); rows.push([y, cx - h, cx + h]); }
      return rows;
    };

    // --- Golden Gate ---
    const bridgeSpan = Math.max(56, Math.min(170, Math.round(W * 0.28)));
    towerA = Math.round(Math.max(16, W * 0.09));
    towerB = towerA + bridgeSpan;
    anchorR = towerB + Math.round(bridgeSpan * 0.4);
    const anchorL = towerA - Math.round(bridgeSpan * 0.45);
    const mid = (towerA + towerB) / 2;
    const cTop = TOP + 1, cLow = DECK - 3;
    const cableY = (x: number) => {
      if (x >= towerA && x <= towerB) return cTop + (cLow - cTop) * (1 - ((x - mid) / (bridgeSpan / 2)) ** 2);
      const side = x < towerA ? (towerA - x) / (towerA - anchorL) : (x - towerB) / (anchorR - towerB);
      const u = Math.min(1, side);
      return cTop + (DECK - 2 - cTop) * (2 * u - u * u);
    };

    rect(0, DECK, anchorR + 6, 2, COLORS.bridge);
    // Sparse, dotted suspenders: a hint, not a mesh
    for (let x = Math.max(0, anchorL); x < anchorR; x += 6) {
      if (Math.abs(x - towerA) < 4 || Math.abs(x - towerB) < 4) continue;
      for (let y = Math.round(cableY(x)) + 2; y < DECK; y += 2) px(x, y, COLORS.bridge);
    }
    let prev = Math.round(cableY(Math.max(0, anchorL)));
    for (let x = Math.max(0, anchorL); x <= anchorR; x++) {
      const y = Math.round(cableY(x));
      rect(x, Math.min(y, prev), 1, Math.abs(y - prev) + 1, COLORS.bridge);
      prev = y;
    }
    for (const cx of [towerA, towerB]) {
      for (const lx of [cx - 3, cx + 2]) {
        rect(lx, TOP, 1, HZ - TOP, COLORS.bridge);
        rect(lx + 1, TOP, 1, HZ - TOP, COLORS.bridgeShade);
      }
      for (const sy of [TOP, TOP + 1, TOP + 12, TOP + 24, DECK + 5]) rect(cx - 3, sy, 7, 1, COLORS.bridge);
      beacons.push({ x: cx - 3, y: TOP - 1, phase: rng() });
      beacons.push({ x: cx + 3, y: TOP - 1, phase: rng() });
    }

    // Marin Headlands (after the bridge so the road disappears into them)
    const hillEnd = towerA - 6;
    for (let x = 0; x < hillEnd; x++) {
      const u = x / hillEnd;
      const h = Math.round(4 + 22 * (1 - u ** 1.7) + 1.2 * Math.sin(x * 0.3));
      rect(x, HZ - h, 1, h, COLORS.mist);
    }

    // Shoreline
    rect(anchorR - 6, B, W, HZ - B, COLORS.city);
    const cs = anchorR + 3;
    const ce = W - 2;
    const cw = ce - cs;
    const at = (f: number) => Math.round(cs + f * cw);

    // Twin Peaks + Sutro Tower, far back
    const tp = at(0.42);
    for (let x = tp - 30; x < tp + 32; x++) {
      const b1 = Math.max(0, Math.cos(((x - (tp - 8)) / 22) * (Math.PI / 2))) * 20;
      const b2 = Math.max(0, Math.cos(((x - (tp + 12)) / 20) * (Math.PI / 2))) * 17;
      const h = Math.round(Math.max(b1, b2));
      if (h > 0) rect(x, B - h, 1, h, COLORS.haze);
    }
    if (cw >= 120) {
      const sx = tp - 8, gy = B - 20;
      rect(sx, gy - 28, 1, 28, COLORS.haze);
      rect(sx - 4, gy - 28, 9, 1, COLORS.haze);
      for (const [dx, len] of [[-4, 5], [0, 7], [4, 5]] as const) rect(sx + dx, gy - 28 - len, 1, len, COLORS.haze);
    }

    // Back row: low and pale, just enough to give the city depth
    for (let x = cs; x < ce;) {
      const w = 5 + Math.floor(rng() * 6);
      const centre = 1 - Math.abs((x - cs) / cw - 0.6);
      const h = Math.round(10 + rng() * 18 * (0.5 + centre));
      rect(x, B - h, w, h, COLORS.haze);
      x += w;
    }

    // Landmarks: SF, then New York
    const wide = cw >= 150;
    if (wide) {
      // Coit Tower on Telegraph Hill
      const cx = at(0.03);
      for (let dx = -12; dx <= 12; dx++) {
        const h = Math.round(9 * Math.cos((dx / 12) * (Math.PI / 2)));
        rect(cx + dx, B - h, 1, h, COLORS.city);
      }
      rect(cx - 1, B - 24, 3, 15, COLORS.city);
      rect(cx - 2, B - 25, 5, 1, COLORS.city);
    }
    {
      // Transamerica Pyramid
      const cx = at(0.16), h = 58, y0 = B - h;
      const rows = span(y0, B, y => Math.round(((y - y0) / h) * 5.5), cx);
      fill(rows);
      addWindows(cx - 3, cx + 3, B - 24, B, 0.08);
      rect(cx, y0 - 7, 1, 7, COLORS.city);
    }
    {
      // Salesforce Tower
      const cx = at(0.3), h = 66, y0 = B - h;
      fill(span(y0, B, y => {
        const k = y - y0;
        return k === 0 ? 2 : k === 1 ? 3 : k < h / 2 ? 4 : 5;
      }, cx));
      addWindows(cx - 4, cx + 4, y0 + 10, B, 0.06);
    }
    {
      // Empire State Building
      const cx = at(0.58);
      const tiers: [number, number, number][] = [[0, 10, 7], [10, 32, 5], [32, 44, 3], [44, 48, 2], [48, 52, 1]];
      for (const [a, b, half] of tiers) fill(span(B - b, B - a, () => half, cx));
      rect(cx, B - 60, 1, 8, COLORS.city);
      addWindows(cx - 5, cx + 5, B - 32, B - 10, 0.08);
    }
    {
      // Chrysler Building, stepped crown + needle
      const cx = at(0.74), body = 34;
      fill(span(B - body, B, () => 4, cx));
      [4, 3, 3, 2, 2, 1].forEach((half, i) => {
        const y = B - body - (i + 1) * 2;
        fill([[y, cx - half, cx + half], [y + 1, cx - half, cx + half]]);
      });
      rect(cx, B - body - 22, 1, 10, COLORS.city);
      addWindows(cx - 3, cx + 3, B - body, B, 0.07);
    }
    if (wide) {
      // One World Trade Center
      const cx = at(0.9), h = 60, y0 = B - h;
      fill(span(y0, B, y => (y > B - 6 ? 5 : Math.round(2 + 3 * ((y - y0) / (h - 6)))), cx));
      rect(cx, y0 - 12, 1, 12, COLORS.city);
      beacons.push({ x: cx, y: y0 - 13, phase: rng() });
    }

    // Low front row
    for (let x = cs - 2; x < ce;) {
      const w = 6 + Math.floor(rng() * 7);
      const h = 4 + Math.round(rng() * 9);
      rect(x, B - h, w, h, COLORS.city);
      addWindows(x, x + w - 1, B - h, B, 0.08);
      x += w;
    }

    fgData = fgx.getImageData(0, 0, W, H).data;
  }

  // ---------- per frame ----------

  function paintSoft(t: number) {
    const sunX = (towerA + towerB) / 2;
    const sunY = HZ - 14;

    const sky = bgx.createLinearGradient(0, 0, 0, HZ);
    sky.addColorStop(0, COLORS.page);
    sky.addColorStop(0.2, COLORS.page);
    sky.addColorStop(0.75, COLORS.sand);
    sky.addColorStop(1, COLORS.blush);
    bgx.fillStyle = sky;
    bgx.fillRect(0, 0, W, HZ);

    const glow = bgx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 40);
    glow.addColorStop(0, 'rgba(255,253,244,0.9)');
    glow.addColorStop(1, 'rgba(255,253,244,0)');
    bgx.fillStyle = glow;
    bgx.fillRect(0, 0, W, HZ);
    bgx.fillStyle = COLORS.page;
    bgx.beginPath();
    bgx.arc(sunX, sunY, 9, 0, Math.PI * 2);
    bgx.fill();

    // Hazy far ridge
    bgx.fillStyle = 'rgba(221,211,204,0.6)';
    bgx.beginPath();
    bgx.moveTo(0, HZ);
    for (let x = 0; x <= W; x += 2) bgx.lineTo(x, HZ - 4 - 3 * Math.sin(x * 0.021 + 1) - 1.5 * Math.sin(x * 0.073));
    bgx.lineTo(W, HZ);
    bgx.fill();

    // Soft fog behind the bridge
    for (let i = 0; i < 5; i++) {
      const x = ((i * 131 + t * (2 + i)) % (W + 120)) - 60;
      const y = HZ - 5 - (i % 3) * 4;
      bgx.save();
      bgx.translate(x, y);
      bgx.scale(5, 1);
      const g = bgx.createRadialGradient(0, 0, 0, 0, 0, 8);
      g.addColorStop(0, 'rgba(255,253,244,0.6)');
      g.addColorStop(1, 'rgba(255,253,244,0)');
      bgx.fillStyle = g;
      bgx.fillRect(-8, -8, 16, 16);
      bgx.restore();
    }

    // Water: picks up the sky near the horizon, fades back to the page at the bottom
    const water = bgx.createLinearGradient(0, HZ, 0, H);
    water.addColorStop(0, COLORS.haze);
    water.addColorStop(0.45, COLORS.sand);
    water.addColorStop(1, COLORS.page);
    bgx.fillStyle = water;
    bgx.fillRect(0, HZ, W, H - HZ);

    // Faint, rippling reflection
    for (let k = 0; k < 16; k++) {
      bgx.globalAlpha = 0.22 * (1 - k / 16);
      const dx = Math.round(Math.sin(k * 0.9 + t * 1.5) * (0.4 + k / 16));
      bgx.drawImage(fg, 0, HZ - 1 - k, W, 1, dx, HZ + k, W, 1);
    }
    bgx.globalAlpha = 1;

    // A little sun glitter
    for (let k = 0; k < 14; k++) {
      const w = 16 - k;
      const off = Math.sin(t * 1.2 + k * 1.3) * 1.5;
      bgx.fillStyle = `rgba(255,253,244,${0.75 * (1 - k / 14)})`;
      for (let s = -w / 2; s < w / 2; s += 5) {
        if (Math.sin(s * 1.9 + k * 2.3 + t * 2) > 0.3) bgx.fillRect(Math.round(sunX + s + off), HZ + 1 + k, 3, 1);
      }
    }
  }

  function dither(d: Uint8ClampedArray) {
    const L = lut();
    for (let y = 0; y < H; y++) {
      const row = (y & 3) * 4;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (r === PAGE[0] && g === PAGE[1] && b === PAGE[2]) continue; // flat page colour stays flat
        const o = BAYER[row + (x & 3)];
        const q = (v: number) => (v + o < 0 ? 0 : v + o > 255 ? 31 : (v + o) >> 3);
        const p = PAL[L[(q(r) << 10) | (q(g) << 5) | q(b)]];
        d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255;
      }
    }
  }

  function frame(t: number) {
    if (!W || !img) return;
    paintSoft(t);
    const d = bgx.getImageData(0, 0, W, H).data;
    dither(d);

    for (let i = 0; i < d.length; i += 4) {
      if (fgData[i + 3] > 128) { d[i] = fgData[i]; d[i + 1] = fgData[i + 1]; d[i + 2] = fgData[i + 2]; }
    }

    const set = (x: number, y: number, c: RGB) => {
      if (x < 0 || x >= W || y < 0 || y >= H) return;
      const i = (y * W + x) * 4;
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
    };

    for (const w of twinkles) if (Math.sin(t * 0.5 + w.phase) > 0) set(w.x, w.y, WINDOW);
    for (const b of beacons) if ((t * 0.5 + b.phase) % 1 < 0.4) set(b.x, b.y, BEACON);

    if (pointer) {
      for (const w of windows) {
        const dist = Math.hypot(w.x - pointer.x, (w.y - pointer.y) * 1.3);
        if (dist < 24 && w.h < 1 - dist / 24) set(w.x, w.y, WINDOW);
      }
    }

    // Fog bank rolling in through the Gate, dithered by density
    for (let y = DECK - 12; y < HZ + 4; y++) {
      const band = Math.max(0, 1 - Math.abs(y - (DECK + 3)) / 12);
      const row = (y & 3) * 4;
      for (let x = 0; x < W; x++) {
        const env = x < anchorR ? 1 : Math.max(0, 1 - (x - anchorR) / 30);
        const n = 0.5 + 0.28 * Math.sin((x - t * 4) * 0.09 + y * 0.31) + 0.22 * Math.sin((x - t * 2.5) * 0.033 - y * 0.12 + 1.7);
        const dens = band * env * Math.max(0, n - 0.3) * 1.3; // patchy, not a blanket
        if (dens <= BAYER[row + (x & 3)] / SPREAD + 0.5) continue;
        const i = (y * W + x) * 4;
        if (fgData[i + 3] > 128 && fgData[i + 1] > 0x9a) continue; // over land the dots read as lights
        set(x, y, FOG);
      }
    }

    img.data.set(d);
    out.putImageData(img, 0, 0);
  }

  return {
    /** Set the art width (in art pixels) and rebuild the silhouettes. */
    resize(width: number) {
      W = Math.max(120, Math.round(width));
      for (const c of [canvas, bg, fg]) { c.width = W; c.height = H; }
      img = out.createImageData(W, H);
      build();
    },
    frame,
    setPointer(p: { x: number; y: number } | null) { pointer = p; },
  };
}
