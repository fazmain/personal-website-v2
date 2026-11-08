'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

// Three tones per palette: light, mid, dark. The tile drifts from one palette
// to the next, so the colours never sit still. All muted to suit the page.
const PALETTES = [
  ['#fbeadb', '#e3a582', '#b0573a'], // rust (the site accent)
  ['#f6ecd0', '#dfbd6e', '#a8782f'], // brass
  ['#e5f0ea', '#97c2b4', '#4b7a78'], // sea glass
  ['#e8edf7', '#9db2d8', '#4d6594'], // fog blue
  ['#f0e8f2', '#bfa6c8', '#76618f'], // dusk lilac
].map(p => p.map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))));

const SECONDS_PER_PALETTE = 7;
const FPS = 15;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The line-art avatar on a square tile of slowly flowing, ordered-dithered
 * colour. Light around the face so the lines stay readable, darker at the edges.
 * Hovering speeds the flow up a little.
 */
export default function DitherAvatar({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let size = 0;
    let img: ImageData | null = null;
    let raf = 0;
    let last = -Infinity;
    let clock = 0; // flow time, runs faster while hovered
    let speed = 1;
    let prev = performance.now();

    const draw = () => {
      if (!img) return;
      const t = clock;
      const phase = t / SECONDS_PER_PALETTE;
      const i = Math.floor(phase) % PALETTES.length;
      const f = smooth(0.6, 1, phase % 1); // hold, then blend
      const a = PALETTES[i], b = PALETTES[(i + 1) % PALETTES.length];
      const tones = a.map((c, k) => c.map((v, ch) => Math.round(v + (b[k][ch] - v) * f)));
      const d = img.data;
      for (let y = 0; y < size; y++) {
        const v = y / size;
        for (let x = 0; x < size; x++) {
          const u = x / size;
          const warp = Math.sin(u * 5 + t * 0.6) + Math.sin(v * 4.3 - t * 0.45);
          const n = 0.5
            + 0.25 * Math.sin((u * 3.1 + v * 2.2) * 3 + warp + t * 0.5)
            + 0.25 * Math.sin(u * 7.3 - v * 5.1 + t * 0.8 + warp * 0.5);
          const r = Math.hypot(u - 0.5, (v - 0.45) * 1.1);
          const val = n * 0.5 + smooth(0.22, 0.72, r) * 0.6 - 0.12;
          const q = Math.min(2, Math.max(0, Math.floor(val * 2 + BAYER[(y & 3) * 4 + (x & 3)])));
          const c = tones[q];
          const o = (y * size + x) * 4;
          d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const fit = () => {
      const css = wrap.clientWidth;
      size = Math.max(16, Math.round(css / (css >= 140 ? 3 : 2)));
      canvas.width = canvas.height = size;
      img = ctx.createImageData(size, size);
      draw();
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      clock += ((now - prev) / 1000) * speed;
      prev = now;
      if (now - last < 1000 / FPS) return;
      last = now;
      draw();
    };

    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    if (!still) raf = requestAnimationFrame(loop);
    const fast = () => { speed = 3; };
    const slow = () => { speed = 1; };
    wrap.addEventListener('pointerenter', fast);
    wrap.addEventListener('pointerleave', slow);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener('pointerenter', fast);
      wrap.removeEventListener('pointerleave', slow);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative shrink-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full [image-rendering:pixelated]" />
      <Image src="/avatar.svg" alt="Faiaz Azmain Avatar" fill priority sizes="168px" className="relative object-contain p-[6%]" />
    </div>
  );
}
