// A dithered, pixel-art SF × NYC skyline at sunset, drawn on a <canvas>.
//
// Pipeline for each frame:
//   1. Paint the soft stuff (sky, sun, haze, back fog, water, reflections) with
//      ordinary canvas gradients onto `bg`.
//   2. Ordered-dither that to a small palette (4×4 Bayer), which turns every
//      gradient into the chunky dot pattern.
//   3. Stamp the crisp foreground (bridge, hills, buildings), built once per
//      resize from whole pixels in palette colours, so it never gets dithered.
//   4. Add live pixels (twinkling windows, beacons, cars, ESB lights, windows
//      around the cursor) and a dithered fog bank rolling through the Gate.
//
// All coordinates are in art pixels; the canvas is scaled up with
// `image-rendering: pixelated`.

type RGB = readonly [number, number, number];

const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

export const COLORS = {
  cream: '#fffdf4', // = page background, so the sky starts seamlessly
  sand: '#f6e3c4',
  peach: '#efb98a',
  amber: '#e08a4f',
  mauve: '#a8606a',
  rust: '#ac4c2e', // site accent, doubles as International Orange
  rustDark: '#7f3622',
  plum: '#6b3a4a',
  slate: '#3d4a66',
  navy: '#1c2331', // = page foreground
  gold: '#f5c76a',
  red: '#e0473a',
} as const;

// Colours the soft layers are dithered to.
const DITHER_PALETTE = ['cream', 'sand', 'peach', 'amber', 'mauve', 'rust', 'plum', 'slate', 'navy'] as const;
const SPREAD = 56;
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

type Light = { x: number; y: number; phase: number; color: RGB };
type Car = { offset: number; speed: number; color: RGB };

export function createCityscape(canvas: HTMLCanvasElement) {
  const out = canvas.getContext('2d')!;
  const bg = document.createElement('canvas');
  const bgx = bg.getContext('2d', { willReadFrequently: true })!;
  const fg = document.createElement('canvas');
  const fgx = fg.getContext('2d', { willReadFrequently: true })!;

  const H = ART_HEIGHT;
  const HZ = H - 28; // horizon / waterline
  const B = HZ - 3; // street level
  const DECK = HZ - 12;
  const TOP = HZ - 62; // bridge tower tops

  let W = 0;
  let fgData = new Uint8ClampedArray(0);
  let img: ImageData | null = null;
  let towerA = 0, towerB = 0, anchorR = 0;
  let twinkles: Light[] = [];
  let beacons: Light[] = [];
  let windows: { x: number; y: number; h: number }[] = []; // every window, for the cursor glow
  let esbLights: { x: number; y: number }[] = [];
  let cars: Car[] = [];
  let pointer: { x: number; y: number } | null = null;

  // ---------- foreground (crisp, built once per size) ----------

  function rect(x: number, y: number, w: number, h: number, c: string) {
    fgx.fillStyle = c;
    fgx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  const px = (x: number, y: number, c: string) => rect(x, y, 1, 1, c);

  function build() {
    const rng = mulberry32(1906);
    fgx.clearRect(0, 0, W, H);
    twinkles = []; beacons = []; windows = []; esbLights = [];

    const addWindow = (x: number, y: number, p: number, colors: string[] = [COLORS.gold, COLORS.sand]) => {
      const h = rng();
      windows.push({ x, y, h });
      if (h >= p) return;
      const color = colors[Math.floor(rng() * colors.length)];
      if (rng() < 0.25) twinkles.push({ x, y, phase: rng() * 10, color: hex(color) });
      else px(x, y, color);
    };

    // Rows of [y, xLeft, xRight] filled navy, with a warm rim on the sunset (left) side.
    const shape = (rows: [number, number, number][], body: string = COLORS.navy, rim: string | null = COLORS.plum, winP = 0.1) => {
      for (const [y, l, r] of rows) rect(l, y, r - l + 1, 1, body);
      if (rim) for (const [y, l] of rows) px(l, y, rim);
      if (winP > 0)
        for (const [y, l, r] of rows)
          if ((B - y) % 3 === 1) for (let x = l + 2; x < r - 0; x += 2) addWindow(x, y, winP);
    };
    const span = (y0: number, y1: number, half: (y: number) => number, cx: number) => {
      const rows: [number, number, number][] = [];
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

    // Deck and truss
    rect(0, DECK, anchorR + 6, 2, COLORS.rust);
    for (let x = 0; x < anchorR + 6; x += 2) px(x, DECK + 2, COLORS.rustDark);
    // Suspenders (dotted so they read as thin)
    for (let x = Math.max(0, anchorL); x < anchorR; x += 4) {
      if (Math.abs(x - towerA) < 4 || Math.abs(x - towerB) < 4) continue;
      for (let y = Math.round(cableY(x)) + 2; y < DECK; y += 2) px(x, y, COLORS.rust);
    }
    // Main cable
    let prev = Math.round(cableY(Math.max(0, anchorL)));
    for (let x = Math.max(0, anchorL); x <= anchorR; x++) {
      const y = Math.round(cableY(x));
      rect(x, Math.min(y, prev), 1, Math.abs(y - prev) + 1, COLORS.rust);
      prev = y;
    }
    // Towers: two legs, portal struts, little caps
    for (const cx of [towerA, towerB]) {
      for (const lx of [cx - 3, cx + 2]) {
        rect(lx, TOP, 1, HZ - TOP, COLORS.rust);
        rect(lx + 1, TOP, 1, HZ - TOP, COLORS.rustDark);
      }
      for (const sy of [TOP, TOP + 1, TOP + 11, TOP + 21, TOP + 32, DECK + 6]) rect(cx - 3, sy, 7, 1, COLORS.rust);
      rect(cx - 3, TOP - 2, 2, 2, COLORS.rust);
      rect(cx + 2, TOP - 2, 2, 2, COLORS.rust);
      rect(cx - 5, HZ - 3, 11, 3, COLORS.slate);
      beacons.push({ x: cx - 3, y: TOP - 3, phase: rng(), color: hex(COLORS.red) });
      beacons.push({ x: cx + 3, y: TOP - 3, phase: rng(), color: hex(COLORS.red) });
    }

    // Marin Headlands (drawn after the bridge so the road disappears into them)
    const hillEnd = towerA - 6;
    for (let x = 0; x < hillEnd; x++) {
      const u = x / hillEnd;
      const h = Math.round(4 + 24 * (1 - u ** 1.7) + 1.5 * Math.sin(x * 0.35));
      rect(x, HZ - h, 1, h, COLORS.navy);
      px(x, HZ - h, COLORS.plum);
    }

    // San Francisco shoreline
    rect(anchorR - 6, B, W, HZ - B, COLORS.navy);
    const cs = anchorR + 3;
    const ce = W - 2;
    const cw = ce - cs;
    const at = (f: number) => Math.round(cs + f * cw);

    // Twin Peaks + Sutro Tower (behind the city)
    const tp = at(0.42);
    for (let x = tp - 30; x < tp + 32; x++) {
      const b1 = Math.max(0, Math.cos(((x - (tp - 8)) / 22) * (Math.PI / 2))) * 20;
      const b2 = Math.max(0, Math.cos(((x - (tp + 12)) / 20) * (Math.PI / 2))) * 17;
      const h = Math.round(Math.max(b1, b2));
      if (h > 0) rect(x, B - h, 1, h, COLORS.plum);
    }
    if (cw >= 120) {
      const sx = tp - 8, gy = B - 20;
      rect(sx, gy - 30, 1, 30, COLORS.plum);
      for (let k = 0; k < 20; k++) {
        const d = Math.round(3 * (1 - k / 20));
        px(sx - d, gy - k, COLORS.plum);
        px(sx + d, gy - k, COLORS.plum);
      }
      rect(sx - 3, gy - 18, 7, 1, COLORS.plum);
      rect(sx - 4, gy - 30, 9, 1, COLORS.plum);
      for (const [dx, len] of [[-4, 6], [0, 8], [4, 6]] as const) {
        rect(sx + dx, gy - 30 - len, 1, len, COLORS.plum);
        beacons.push({ x: sx + dx, y: gy - 31 - len, phase: rng(), color: hex(COLORS.red) });
      }
    }

    // Back row of buildings
    for (let x = cs; x < ce;) {
      const w = 4 + Math.floor(rng() * 5);
      const centre = 1 - Math.abs((x - cs) / cw - 0.6);
      const h = Math.round(12 + rng() * 22 * (0.5 + centre));
      rect(x, B - h, w, h, COLORS.slate);
      for (let y = B - h + 2; y < B - 1; y += 3) for (let wx = x + 1; wx < x + w - 1; wx += 2) addWindow(wx, y, 0.06, [COLORS.peach]);
      x += w + (rng() < 0.3 ? 1 : 0);
    }

    // Landmarks, SF first, then New York
    const wide = cw >= 150;
    if (wide) {
      // Coit Tower on Telegraph Hill
      const cx = at(0.03);
      for (let dx = -12; dx <= 12; dx++) {
        const h = Math.round(9 * Math.cos((dx / 12) * (Math.PI / 2)));
        rect(cx + dx, B - h, 1, h, COLORS.navy);
      }
      shape(span(B - 24, B - 9, () => 1, cx), COLORS.navy, COLORS.plum, 0);
      rect(cx - 2, B - 25, 5, 1, COLORS.navy);
      for (const dx of [-2, 0, 2]) px(cx + dx, B - 26, COLORS.navy);
    }
    {
      // Transamerica Pyramid
      const cx = at(0.16), h = 60, y0 = B - h;
      shape(span(y0, B, y => Math.round(((y - y0) / h) * 5.5), cx));
      for (let y = B - Math.round(h * 0.62); y < B - Math.round(h * 0.62) + 8; y++) {
        const half = Math.round(((y - y0) / h) * 5.5) + 1;
        px(cx - half, y, COLORS.plum);
        px(cx + half, y, COLORS.navy);
      }
      rect(cx, y0 - 8, 1, 8, COLORS.navy);
      beacons.push({ x: cx, y: y0 - 9, phase: rng(), color: hex(COLORS.red) });
    }
    {
      // Salesforce Tower with its lattice crown
      const cx = at(0.3), h = 68, y0 = B - h;
      shape(span(y0, B, y => {
        const k = y - y0;
        if (k === 0) return 2;
        if (k === 1) return 3;
        return k < h / 2 ? 4 : 5;
      }, cx));
      for (let y = y0 + 1; y < y0 + 8; y++) for (let x = cx - 3; x <= cx + 3; x++) if ((x + y) % 2) px(x, y, COLORS.slate);
    }
    {
      // Empire State Building, tiers + spire + coloured top lights
      const cx = at(0.58);
      const tiers: [number, number, number][] = [[0, 10, 7], [10, 32, 5], [32, 44, 3], [44, 48, 2], [48, 52, 1]];
      for (const [a, b, half] of tiers) shape(span(B - b, B - a, () => half, cx), COLORS.navy, COLORS.plum, half > 2 ? 0.12 : 0);
      rect(cx, B - 61, 1, 9, COLORS.navy);
      beacons.push({ x: cx, y: B - 62, phase: rng(), color: hex(COLORS.red) });
      for (let y = B - 52; y < B - 44; y++) for (let x = cx - 1; x <= cx + 1; x++) if ((x + y) % 2 === 0) esbLights.push({ x, y });
    }
    {
      // Chrysler Building, stacked crown with sunburst windows + needle
      const cx = at(0.74), body = 34;
      shape(span(B - 6, B, () => 5, cx), COLORS.navy, COLORS.plum, 0);
      shape(span(B - body, B - 6, () => 4, cx));
      const halves = [4, 3, 3, 2, 2, 1];
      halves.forEach((half, i) => {
        const y = B - body - (i + 1) * 2;
        shape([[y, cx - half, cx + half], [y + 1, cx - half, cx + half]], COLORS.navy, COLORS.plum, 0);
        for (let x = cx - half + 1; x < cx + half; x += 2) px(x, y + 1, COLORS.gold);
      });
      rect(cx, B - body - 24, 1, 12, COLORS.navy);
    }
    if (wide) {
      // One World Trade Center, tapering with chamfered facets
      const cx = at(0.9), h = 62, y0 = B - h;
      shape(span(y0, B, y => (y > B - 6 ? 5 : Math.round(2 + 3 * ((y - y0) / (h - 6)))), cx), COLORS.navy, COLORS.plum, 0.08);
      for (let y = y0; y < B - 6; y++) {
        const k = Math.round(3 * ((y - y0) / (h - 6)));
        px(cx - k, y, COLORS.slate);
        px(cx + k, y, COLORS.slate);
      }
      rect(cx, y0 - 13, 1, 13, COLORS.navy);
      beacons.push({ x: cx, y: y0 - 14, phase: rng(), color: hex(COLORS.red) });
    }

    // Low front row
    for (let x = cs - 2; x < ce;) {
      const w = 5 + Math.floor(rng() * 6);
      const h = 4 + Math.round(rng() * 11);
      rect(x, B - h, w, h, COLORS.navy);
      px(x, B - h, COLORS.plum);
      for (let y = B - h + 2; y < B - 1; y += 3) for (let wx = x + 1; wx < x + w - 1; wx += 2) addWindow(wx, y, 0.2);
      x += w;
    }

    // Traffic on the bridge
    cars = Array.from({ length: Math.max(4, Math.round(W / 40)) }, (_, i) => ({
      offset: rng() * 1000,
      speed: (i % 2 ? -1 : 1) * (6 + rng() * 6),
      color: hex(i % 2 ? COLORS.red : COLORS.sand),
    }));

    fgData = fgx.getImageData(0, 0, W, H).data;
  }

  // ---------- per frame ----------

  function paintSoft(t: number) {
    const sunX = (towerA + towerB) / 2;
    const sunY = HZ - 13;

    const sky = bgx.createLinearGradient(0, 0, 0, HZ);
    sky.addColorStop(0, COLORS.cream);
    sky.addColorStop(0.16, COLORS.cream);
    sky.addColorStop(0.42, COLORS.sand);
    sky.addColorStop(0.7, COLORS.peach);
    sky.addColorStop(0.92, COLORS.amber);
    sky.addColorStop(1, '#d7765a');
    bgx.fillStyle = sky;
    bgx.fillRect(0, 0, W, HZ);

    const glow = bgx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 46);
    glow.addColorStop(0, 'rgba(255,240,205,0.9)');
    glow.addColorStop(1, 'rgba(255,240,205,0)');
    bgx.fillStyle = glow;
    bgx.fillRect(0, 0, W, HZ);
    bgx.fillStyle = COLORS.cream;
    bgx.beginPath();
    bgx.arc(sunX, sunY, 10, 0, Math.PI * 2);
    bgx.fill();

    // Hazy far ridge (East Bay / Jersey, take your pick)
    bgx.fillStyle = 'rgba(168,96,106,0.55)';
    bgx.beginPath();
    bgx.moveTo(0, HZ);
    for (let x = 0; x <= W; x += 2) bgx.lineTo(x, HZ - 5 - 4 * Math.sin(x * 0.021 + 1) - 2 * Math.sin(x * 0.073));
    bgx.lineTo(W, HZ);
    bgx.fill();

    // Soft fog behind the bridge
    for (let i = 0; i < 6; i++) {
      const x = ((i * 113 + t * (3 + i)) % (W + 120)) - 60;
      const y = HZ - 5 - (i % 3) * 4;
      bgx.save();
      bgx.translate(x, y);
      bgx.scale(5, 1);
      const g = bgx.createRadialGradient(0, 0, 0, 0, 0, 8);
      g.addColorStop(0, 'rgba(255,248,236,0.55)');
      g.addColorStop(1, 'rgba(255,248,236,0)');
      bgx.fillStyle = g;
      bgx.fillRect(-8, -8, 16, 16);
      bgx.restore();
    }

    // Water
    const water = bgx.createLinearGradient(0, HZ, 0, H);
    water.addColorStop(0, COLORS.mauve);
    water.addColorStop(0.35, COLORS.plum);
    water.addColorStop(0.7, COLORS.slate);
    water.addColorStop(1, COLORS.navy);
    bgx.fillStyle = water;
    bgx.fillRect(0, HZ, W, H - HZ);

    // Reflection of the skyline, rippling
    bgx.globalAlpha = 0.2;
    for (let k = 0; k < H - HZ; k++) {
      const dx = Math.round(Math.sin(k * 0.9 + t * 2) * (0.4 + k / 20));
      bgx.drawImage(fg, 0, HZ - 1 - k, W, 1, dx, HZ + k, W, 1);
    }
    bgx.globalAlpha = 1;

    // Sun glitter
    for (let k = 0; k < H - HZ; k++) {
      const w = 22 - k * 0.5;
      if (w <= 0) break;
      const a = 0.7 * (1 - k / (H - HZ));
      const off = Math.sin(t * 1.7 + k * 1.3) * 2;
      bgx.fillStyle = `rgba(250,226,180,${a})`;
      for (let s = -w / 2; s < w / 2; s += 5) {
        if (Math.sin(s * 1.9 + k * 2.3 + t * 3) > 0.2) bgx.fillRect(Math.round(sunX + s + off), HZ + k, 3, 1);
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
        if (r === 255 && g === 253 && b === 244) continue; // flat page background stays flat
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

    // Stamp crisp foreground
    for (let i = 0; i < d.length; i += 4) {
      if (fgData[i + 3] > 128) { d[i] = fgData[i]; d[i + 1] = fgData[i + 1]; d[i + 2] = fgData[i + 2]; }
    }

    const set = (x: number, y: number, c: RGB) => {
      if (x < 0 || x >= W || y < 0 || y >= H) return;
      const i = (y * W + x) * 4;
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
    };

    for (const w of twinkles) if (Math.sin(t * 0.6 + w.phase) > -0.3) set(w.x, w.y, w.color);
    for (const b of beacons) if ((t * 0.7 + b.phase) % 1 < 0.45) set(b.x, b.y, b.color);

    const esbColors = [hex(COLORS.rust), hex(COLORS.gold), hex(COLORS.sand)];
    const esb = esbColors[Math.floor(t / 4) % esbColors.length];
    for (const p of esbLights) set(p.x, p.y, esb);

    // Cars: only where the deck is open sky above (not inside the headlands)
    const road = anchorR + 6;
    for (const c of cars) {
      const x = Math.floor((((c.offset + t * c.speed) % road) + road) % road);
      const i = ((DECK - 1) * W + x) * 4;
      if (fgData[i + 3] > 128) continue;
      set(x, DECK - 1, c.color);
    }

    // Windows light up around the cursor
    if (pointer) {
      const gold = hex(COLORS.gold);
      for (const w of windows) {
        const dist = Math.hypot(w.x - pointer.x, (w.y - pointer.y) * 1.3);
        if (dist < 24 && w.h < 1 - dist / 24) set(w.x, w.y, gold);
      }
    }

    // Fog bank rolling in through the Gate, dithered by density
    const fogC = hex(COLORS.sand);
    for (let y = DECK - 12; y < HZ + 4; y++) {
      const band = Math.max(0, 1 - Math.abs(y - (DECK + 3)) / 12);
      const row = (y & 3) * 4;
      for (let x = 0; x < W; x++) {
        const env = x < anchorR ? 1 : Math.max(0.1, 1 - (x - anchorR) / 60);
        const n = 0.5 + 0.28 * Math.sin((x - t * 5) * 0.09 + y * 0.31) + 0.22 * Math.sin((x - t * 3) * 0.033 - y * 0.12 + 1.7);
        const dens = band * env * Math.max(0, n - 0.3) * 1.3; // patchy, not a blanket
        if (dens <= BAYER[row + (x & 3)] / SPREAD + 0.5) continue;
        const i = (y * W + x) * 4;
        if (fgData[i + 3] > 128 && fgData[i] < 80) continue; // dots on dark land read as lights, not fog
        set(x, y, fogC);
      }
    }

    img.data.set(d);
    out.putImageData(img, 0, 0);
  }

  return {
    /** Set the art width (in art pixels) and rebuild the foreground. */
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
