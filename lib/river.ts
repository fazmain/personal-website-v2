// "No man ever steps in the same river twice, for it's not the same river and
// he's not the same man." (Heraclitus)
//
// Every visit gets its own accent colour, picked before the page paints and
// never the same as the visitor's previous visit. The page background picks up
// a faint tint of it; the text colour never changes. On a return visit the page
// opens in the previous colour and flows into the new one.
//
// All hues share one lightness and chroma (OKLCH), so every visit is equally
// calm; lightness is nudged down per hue only as far as needed for the accent
// to pass WCAG AA (4.5:1) as text on its own background.

type RGB = [number, number, number];

// ---------- colour maths (sRGB <-> OKLab/OKLCH) ----------

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function oklabToLinear(L: number, a: number, b: number): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function linearToOklab([r, g, b]: RGB): RGB {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const inGamut = (c: RGB) => c.every(v => v >= -1e-4 && v <= 1 + 1e-4);

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

export function rgbToHex(c: readonly number[]): string {
  return '#' + c.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
}

const linearToHex = (c: RGB) => rgbToHex(c.map(v => toGamma(Math.min(1, Math.max(0, v))) * 255));
const hexToOklab = (hex: string) => linearToOklab(hexToRgb(hex).map(v => toLinear(v / 255)) as RGB);

/** OKLCH -> hex, reducing chroma until the colour fits in sRGB. */
export function oklch(L: number, C: number, hDeg: number): string {
  const h = (hDeg * Math.PI) / 180;
  let c = C;
  let lin = oklabToLinear(L, c * Math.cos(h), c * Math.sin(h));
  while (!inGamut(lin) && c > 0) {
    c -= 0.002;
    lin = oklabToLinear(L, c * Math.cos(h), c * Math.sin(h));
  }
  return linearToHex(lin);
}

/** The same colour, rotated around the hue wheel (OKLCH). */
export function rotateHue(hex: string, deg: number): string {
  const [L, a, b] = hexToOklab(hex);
  const C = Math.hypot(a, b);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return oklch(L, C, h + deg);
}

/** Mix two hex colours in sRGB; t = 0 gives a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex(x.map((v, i) => v + (y[i] - v) * t));
}

function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(v => toLinear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// ---------- the river ----------

/** The site's original paper colour; each palette tints it toward its hue. */
const CREAM = '#fffdf4';
const ACCENT_L = 0.53;
const ACCENT_C = 0.12;
const TINT = 0.011; // how far the background leans toward the hue (OKLab units)
const MIN_CONTRAST = 4.6;

const HUES: [string, number][] = [
  ['rust', 40],
  ['ochre', 72],
  ['olive', 108],
  ['moss', 145],
  ['teal', 192],
  ['river', 232],
  ['indigo', 272],
  ['plum', 318],
  ['rose', 6],
];

export type RiverTheme = {
  /** name */ n: string;
  /** accent */ a: string;
  /** soft accent, for text selection */ s: string;
  /** background */ b: string;
};

function makeTheme(name: string, hue: number): RiverTheme {
  const h = (hue * Math.PI) / 180;
  const [cl, ca, cb] = hexToOklab(CREAM);
  const background = linearToHex(oklabToLinear(cl, ca + TINT * Math.cos(h), cb + TINT * Math.sin(h)));
  let L = ACCENT_L;
  let accent = oklch(L, ACCENT_C, hue);
  while (contrast(accent, background) < MIN_CONTRAST && L > 0.3) {
    L -= 0.01;
    accent = oklch(L, ACCENT_C, hue);
  }
  return { n: name, a: accent, s: oklch(0.9, 0.05, hue), b: background };
}

export const THEMES: RiverTheme[] = HUES.map(([n, h]) => makeTheme(n, h));

/**
 * Inline script for <head>. Runs before first paint:
 *  - same tab, same visit (sessionStorage) -> keep this visit's colour
 *  - new visit -> pick a colour at random, never last visit's (localStorage)
 *  - returning visitor -> start in last visit's colour and flow into the new one
 */
export function riverScript(): string {
  return `(function(){try{
var T=${JSON.stringify(THEMES)},d=document.documentElement,i=null,p=null;
try{var s=sessionStorage.getItem('river:now');if(s!==null&&T[+s])i=+s}catch(e){}
if(i===null){
try{var l=localStorage.getItem('river:last');if(l!==null&&T[+l])p=+l}catch(e){}
do{i=Math.floor(Math.random()*T.length)}while(T.length>1&&i===p);
try{sessionStorage.setItem('river:now',i);localStorage.setItem('river:last',i)}catch(e){}
}
var set=function(t){d.style.setProperty('--accent',t.a);d.style.setProperty('--accent-soft',t.s);d.style.setProperty('--background',t.b)};
d.setAttribute('data-river',T[i].n);
if(p!==null&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
set(T[p]);d.classList.add('river-flow');
requestAnimationFrame(function(){requestAnimationFrame(function(){set(T[i])})});
}else set(T[i]);
}catch(e){}})();`;
}

// ---------- reading the live palette (client only) ----------

let probe: CanvasRenderingContext2D | null = null;
const parsed = new Map<string, string>();

/**
 * The current value of a colour custom property as hex. Goes through a 1×1
 * canvas so any CSS colour syntax works, including the in-between values a
 * browser reports while the palette is flowing.
 */
export function readColorVar(name: string, el: Element = document.documentElement): string {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  const hit = parsed.get(raw);
  if (hit) return hit;
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe || !raw) return '#000000';
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = raw;
  probe.fillRect(0, 0, 1, 1);
  const hex = rgbToHex(Array.from(probe.getImageData(0, 0, 1, 1).data.slice(0, 3)));
  if (parsed.size > 512) parsed.clear();
  parsed.set(raw, hex);
  return hex;
}
