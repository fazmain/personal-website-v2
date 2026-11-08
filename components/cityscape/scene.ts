// A dithered, pixel-art San Francisco at sunset, drawn on a <canvas>: the
// Golden Gate in the fog, the Marin Headlands, Coit Tower, the Transamerica
// Pyramid, Salesforce Tower, and Sutro Tower on Twin Peaks.
// Kept deliberately soft: muted colours close to the page background, so the
// footer reads as part of the page rather than a picture placed on it.
//
// Pipeline for each frame:
//   1. Paint the soft stuff (sky, sun, haze, water, reflection) with ordinary
//      canvas gradients onto `bg`.
//   2. Ordered-dither that to a small palette (4×4 Bayer), which turns every
//      gradient into the dot pattern.
//   3. Stamp the crisp silhouettes, built once per resize from whole pixels,
//      so they never get dithered.
//   4. Add a few live pixels: twinkling windows, beacons, and windows that
//      light up around the cursor.
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
  sand: '#f0e2cc',
  blush: '#e8cfb8',
  clay: '#dcb79d',
  haze: '#ddd3cc', // far shore, hills, back row of buildings
  mist: '#cbbfb8',
  city: '#b3a6a1', // landmarks and front row
  cable: '#bd8a76', // the bridge: a muted International Orange, kin to the site's rust
  cableShade: '#a97a69',
  window: '#f6e8c6',
  beacon: '#cf7a68',
} as const;

// Colours the soft layers are dithered to.
const DITHER_PALETTE = ['page', 'sand', 'blush', 'clay', 'haze', 'mist', 'city'] as const;
const SPREAD = 40;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => ((v + 0.5) / 16 - 0.5) * SPREAD);

export const ART_HEIGHT = 56;

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
  const HZ = H - 9; // waterline
  const B = HZ - 1; // street level
  const DECK = HZ - 6;
  const TOP = HZ - 28; // bridge tower tops

  let W = 0;
  let fgData = new Uint8ClampedArray(0);
  let img: ImageData | null = null;
  let sunX = 0;
  let anchorR = 0;
  let twinkles: Light[] = [];
  let beacons: Light[] = [];
  let windows: { x: number; y: number; h: number }[] = []; // every window slot, for the cursor glow
  let pointer: { x: number; y: number } | null = null;

  const WINDOW = hex(COLORS.window);
  const BEACON = hex(COLORS.beacon);

  // ---------- silhouettes (crisp, built once per size) ----------

  function rect(x: number, y: number, w: number, h: number, c: string) {
    fgx.fillStyle = c;
    fgx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  const px = (x: number, y: number, c: string) => rect(x, y, 1, 1, c);

  function build() {
    const rng = mulberry32(1937);
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
    // Symmetric block centred on cx: rows y0..y1-1, half-width from a function of y.
    const block = (cx: number, y0: number, y1: number, half: (y: number) => number, c: string = COLORS.city) => {
      for (let y = y0; y < y1; y++) { const h = half(y); rect(cx - h, y, 2 * h + 1, 1, c); }
    };

    // --- Golden Gate ---
    const span = Math.max(50, Math.min(150, Math.round(W * 0.24)));
    const towerA = Math.round(Math.max(24, W * 0.1));
    const towerB = towerA + span;
    anchorR = towerB + Math.round(span * 0.35);
    const anchorL = towerA - Math.round(span * 0.42);
    const mid = (towerA + towerB) / 2;
    sunX = mid;
    const cTop = TOP + 1;
    const cableY = (x: number) => {
      if (x >= towerA && x <= towerB) return cTop + (DECK - 2 - cTop) * (1 - ((x - mid) / (span / 2)) ** 2);
      const u = Math.min(1, x < towerA ? (towerA - x) / (towerA - anchorL) : (x - towerB) / (anchorR - towerB));
      return cTop + (DECK - 1 - cTop) * (2 * u - u * u);
    };

    rect(0, DECK, anchorR + 4, 1, COLORS.cable);
    // Sparse, dotted suspenders
    for (let x = Math.max(0, anchorL); x < anchorR; x += 5) {
      if (Math.abs(x - towerA) < 4 || Math.abs(x - towerB) < 4) continue;
      for (let y = Math.round(cableY(x)) + 2; y < DECK; y += 2) px(x, y, COLORS.cable);
    }
    let prev = Math.round(cableY(Math.max(0, anchorL)));
    for (let x = Math.max(0, anchorL); x <= anchorR; x++) {
      const y = Math.round(cableY(x));
      rect(x, Math.min(y, prev), 1, Math.abs(y - prev) + 1, COLORS.cable);
      prev = y;
    }
    // Art Deco towers: two legs tied by portal struts, stepping in near the top
    for (const cx of [towerA, towerB]) {
      for (const lx of [cx - 2, cx + 2]) {
        rect(lx, TOP + 3, 1, HZ - TOP - 3, COLORS.cable);
        rect(lx + (lx < cx ? 1 : -1), TOP + 3, 1, HZ - TOP - 3, COLORS.cableShade);
        rect(lx, TOP, 1, 3, COLORS.cable);
      }
      for (const sy of [TOP + 3, TOP + 9, TOP + 15, DECK + 3]) rect(cx - 2, sy, 5, 1, COLORS.cable);
      rect(cx - 3, HZ - 1, 7, 1, COLORS.mist); // pier
      beacons.push({ x: cx - 2, y: TOP - 1, phase: rng() });
      beacons.push({ x: cx + 2, y: TOP - 1, phase: rng() });
    }

    // Marin Headlands, after the bridge so the road runs into them
    const hillEnd = towerA - 4;
    for (let x = 0; x < hillEnd; x++) {
      const u = x / hillEnd;
      const h = Math.round(2 + 13 * (1 - u ** 1.6) + Math.sin(x * 0.35));
      rect(x, HZ - h, 1, h, COLORS.mist);
    }

    // --- San Francisco ---
    rect(anchorR - 4, B, W, HZ - B, COLORS.city);
    const cs = anchorR + 2;
    const ce = W - 2;
    const cw = ce - cs;
    const at = (f: number) => Math.round(cs + f * cw);
    const wide = cw >= 120;

    // Twin Peaks and Sutro Tower, far back
    const tp = at(wide ? 0.72 : 0.8);
    for (let x = tp - 18; x < tp + 20; x++) {
      const b1 = Math.max(0, Math.cos(((x - (tp - 5)) / 13) * (Math.PI / 2))) * 13;
      const b2 = Math.max(0, Math.cos(((x - (tp + 8)) / 12) * (Math.PI / 2))) * 11;
      const h = Math.round(Math.max(b1, b2));
      if (h > 0) rect(x, B - h, 1, h, COLORS.haze);
    }
    {
      const sx = tp - 5, gy = B - 13;
      rect(sx, gy - 17, 1, 17, COLORS.mist);
      px(sx - 1, gy - 1, COLORS.mist); px(sx + 1, gy - 1, COLORS.mist); // splayed feet
      rect(sx - 2, gy - 11, 5, 1, COLORS.mist);
      rect(sx - 3, gy - 17, 7, 1, COLORS.mist);
      for (const [dx, len] of [[-3, 3], [0, 4], [3, 3]] as const) {
        rect(sx + dx, gy - 17 - len, 1, len, COLORS.mist);
        beacons.push({ x: sx + dx, y: gy - 18 - len, phase: rng() });
      }
    }

    // Back row, pale
    for (let x = cs; x < ce;) {
      const w = 4 + Math.floor(rng() * 5);
      const centre = 1 - Math.abs((x - cs) / cw - 0.35);
      const h = Math.round(5 + rng() * 9 * (0.5 + centre));
      rect(x, B - h, w, h, COLORS.haze);
      x += w;
    }
    if (wide) {
      // Coit Tower on Telegraph Hill
      const cx = at(0.06);
      for (let dx = -8; dx <= 8; dx++) {
        const h = Math.round(6 * Math.cos((dx / 8) * (Math.PI / 2)));
        rect(cx + dx, B - h, 1, h, COLORS.city);
      }
      rect(cx - 1, B - 15, 3, 10, COLORS.city);
      rect(cx - 2, B - 16, 5, 1, COLORS.city);
    }
    {
      // Transamerica Pyramid
      const cx = at(wide ? 0.24 : 0.2), h = 32, y0 = B - h;
      block(cx, y0, B, y => Math.round(((y - y0) / h) * 4));
      rect(cx, y0 - 5, 1, 5, COLORS.city);
      beacons.push({ x: cx, y: y0 - 6, phase: rng() });
      addWindows(cx - 2, cx + 2, B - 14, B, 0.08);
    }
    {
      // Salesforce Tower, rounded crown
      const cx = at(wide ? 0.38 : 0.42), h = 36, y0 = B - h;
      block(cx, y0, B, y => (y === y0 ? 1 : y === y0 + 1 ? 2 : 3));
      addWindows(cx - 3, cx + 3, y0 + 6, B, 0.07);
    }
    {
      // A couple of Financial District slabs beside them
      const cx = at(wide ? 0.5 : 0.6);
      block(cx, B - 22, B, () => 3);
      addWindows(cx - 3, cx + 3, B - 22, B, 0.08);
    }

    // Low front row
    for (let x = cs - 2; x < ce;) {
      const w = 5 + Math.floor(rng() * 6);
      const h = 2 + Math.round(rng() * 6);
      rect(x, B - h, w, h, COLORS.city);
      x += w;
    }

    fgData = fgx.getImageData(0, 0, W, H).data;
  }

  // ---------- per frame ----------

  function paintSoft(t: number) {
    const sunY = HZ - 8;

    const sky = bgx.createLinearGradient(0, 0, 0, HZ);
    sky.addColorStop(0, COLORS.page);
    sky.addColorStop(0.2, COLORS.page);
    sky.addColorStop(0.75, COLORS.sand);
    sky.addColorStop(1, COLORS.blush);
    bgx.fillStyle = sky;
    bgx.fillRect(0, 0, W, HZ);

    const glow = bgx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 24);
    glow.addColorStop(0, 'rgba(255,253,244,0.9)');
    glow.addColorStop(1, 'rgba(255,253,244,0)');
    bgx.fillStyle = glow;
    bgx.fillRect(0, 0, W, HZ);
    bgx.fillStyle = COLORS.page;
    bgx.beginPath();
    bgx.arc(sunX, sunY, 5, 0, Math.PI * 2);
    bgx.fill();

    // Hazy far shore (Jersey)
    bgx.fillStyle = 'rgba(221,211,204,0.6)';
    bgx.beginPath();
    bgx.moveTo(0, HZ);
    for (let x = 0; x <= W; x += 2) bgx.lineTo(x, HZ - 2 - 1.5 * Math.sin(x * 0.03 + 1) - Math.sin(x * 0.09));
    bgx.lineTo(W, HZ);
    bgx.fill();

    // Water: picks up the sky at the waterline, fades back to the page
    const water = bgx.createLinearGradient(0, HZ, 0, H);
    water.addColorStop(0, COLORS.haze);
    water.addColorStop(0.5, COLORS.sand);
    water.addColorStop(0.9, COLORS.page);
    water.addColorStop(1, COLORS.page);
    bgx.fillStyle = water;
    bgx.fillRect(0, HZ, W, H - HZ);

    // Faint, rippling reflection
    for (let k = 0; k < H - HZ - 2; k++) {
      bgx.globalAlpha = 0.25 * (1 - k / (H - HZ - 2));
      const dx = Math.round(Math.sin(k * 1.1 + t * 1.5) * (0.4 + k / 6));
      bgx.drawImage(fg, 0, HZ - 1 - k, W, 1, dx, HZ + k, W, 1);
    }
    bgx.globalAlpha = 1;

    // A little sun glitter
    for (let k = 0; k < 5; k++) {
      const w = 10 - k * 1.5;
      const off = Math.sin(t * 1.2 + k * 1.3) * 1.2;
      bgx.fillStyle = `rgba(255,253,244,${0.8 * (1 - k / 5)})`;
      for (let s = -w / 2; s < w / 2; s += 4) {
        if (Math.sin(s * 1.9 + k * 2.3 + t * 2) > 0.2) bgx.fillRect(Math.round(sunX + s + off), HZ + 1 + k, 2, 1);
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
        if (dist < 18 && w.h < 1 - dist / 18) set(w.x, w.y, WINDOW);
      }
    }

    // Fog rolling in through the Gate, dithered by density; kept off the land
    const FOG = PAGE;
    for (let y = DECK - 7; y < HZ + 2; y++) {
      const band = Math.max(0, 1 - Math.abs(y - (DECK + 1)) / 7);
      const row = (y & 3) * 4;
      for (let x = 0; x < W; x++) {
        const env = x < anchorR ? 1 : Math.max(0, 1 - (x - anchorR) / 20);
        const n = 0.5 + 0.28 * Math.sin((x - t * 3) * 0.12 + y * 0.5) + 0.22 * Math.sin((x - t * 2) * 0.045 - y * 0.2 + 1.7);
        const dens = band * env * Math.max(0, n - 0.3) * 1.3;
        if (dens <= BAYER[row + (x & 3)] / SPREAD + 0.5) continue;
        const i = (y * W + x) * 4;
        if (fgData[i + 3] > 128 && fgData[i + 1] > 0x9a) continue;
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
