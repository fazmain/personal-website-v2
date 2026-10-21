// Leaving /art: cream paper grows back over the dark world from where you clicked,
// with a soft ink fringe, then the next page loads underneath it.

import { fbm } from './noise';
import { PAPER } from './intro';

const DURATION = 1.05;
const TAU = Math.PI * 2;

export function playOutro(canvas: HTMLCanvasElement, x: number, y: number, onCovered: () => void) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    onCovered();
    return () => {};
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.opacity = '1';
  const rMax = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y)) * 1.35;
  const NV = 140;

  let start = -1;
  let raf = 0;
  let done = false;

  function frame(now: number) {
    if (start < 0) start = now;
    const t = (now - start) / 1000;
    const p = Math.min(1, t / DURATION);
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const r0 = e * rMax;

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    ctx!.beginPath();
    for (let j = 0; j <= NV; j++) {
      const a = (j / NV) * TAU;
      const n = fbm(Math.cos(a) * 1.3 + 5, Math.sin(a) * 1.3 + 9, t * 0.5);
      const r = Math.max(0, r0 * (1 + 0.12 * (1 - p) * (n - 0.5) * 2));
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (j === 0) ctx!.moveTo(px, py);
      else ctx!.lineTo(px, py);
    }
    ctx!.closePath();
    ctx!.fillStyle = PAPER;
    ctx!.fill();
    if (p < 1) {
      // A faint, feathered ink edge.
      const fringe: [number, number][] = [[30, 0.03], [14, 0.05], [5, 0.08], [1.2, 0.22]];
      for (const [w, a] of fringe) {
        ctx!.strokeStyle = `rgba(28,35,49,${a})`;
        ctx!.lineWidth = w;
        ctx!.stroke();
      }
      raf = requestAnimationFrame(frame);
    } else if (!done) {
      done = true;
      ctx!.fillRect(0, 0, W, H);
      onCovered();
    }
  }

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
