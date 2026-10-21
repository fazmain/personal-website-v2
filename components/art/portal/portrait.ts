// Loads the line-drawn portrait (public/avatar.svg) and turns it into strokes
// we can draw on a canvas plus points sampled along those strokes.

export interface PortraitStroke {
  path: Path2D;
  width: number;
  length: number;
}

export interface PortraitPoint {
  x: number;
  y: number;
  /** 0..1 order in which this point is "redrawn" during reassembly. */
  order: number;
}

export interface Portrait {
  width: number;
  height: number;
  strokes: PortraitStroke[];
  points: PortraitPoint[];
}

const SVG_NS = 'http://www.w3.org/2000/svg';

const cache = new Map<string, Promise<Portrait | null>>();

/** Loads and samples the portrait once per page session; later calls reuse it. */
export function loadPortrait(src: string, pointCount: number): Promise<Portrait | null> {
  const key = `${src}#${pointCount}`;
  if (!cache.has(key)) cache.set(key, samplePortrait(src, pointCount));
  return cache.get(key)!;
}

export const PORTRAIT_SRC = '/avatar.svg';
export const portraitPointCount = () => (window.innerWidth < 640 ? 2200 : 4200);

/** Start loading the portrait early, e.g. when someone points at the Art link. */
export function warmPortrait() {
  void loadPortrait(PORTRAIT_SRC, portraitPointCount());
}

async function samplePortrait(src: string, pointCount: number): Promise<Portrait | null> {
  try {
    const text = await (await fetch(src)).text();
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const [, , width, height] = (doc.documentElement.getAttribute('viewBox') ?? '0 0 1822 1980').split(/\s+/).map(Number);
    const sources = Array.from(doc.querySelectorAll('path'))
      .map(p => ({ d: p.getAttribute('d') ?? '', width: parseFloat(p.getAttribute('stroke-width') ?? '12') }))
      .filter(p => p.d.trim());

    // Path lengths need a live SVG element, so measure in an invisible one.
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden';
    document.body.appendChild(svg);

    try {
      const measured = sources.map(s => {
        const el = document.createElementNS(SVG_NS, 'path');
        el.setAttribute('d', s.d);
        svg.appendChild(el);
        return { ...s, el, length: el.getTotalLength() };
      });

      const total = measured.reduce((sum, m) => sum + m.length, 0) || 1;
      const points: PortraitPoint[] = [];
      measured.forEach((m, i) => {
        const n = Math.max(1, Math.round((pointCount * m.length) / total));
        for (let k = 0; k < n; k++) {
          const along = (k + Math.random() * 0.8) / n;
          const p = m.el.getPointAtLength(along * m.length);
          // Strokes are redrawn mostly in parallel, loosely in file order.
          points.push({ x: p.x, y: p.y, order: along * 0.65 + (i / measured.length) * 0.35 });
        }
      });

      return {
        width,
        height,
        strokes: measured.map(m => ({ path: new Path2D(m.d), width: m.width, length: m.length })),
        points,
      };
    } finally {
      svg.remove();
    }
  } catch {
    return null;
  }
}
