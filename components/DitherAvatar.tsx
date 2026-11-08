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

// Pull every tone part-way toward the page colour so the tile stays soft.
const PAGE = [0xff, 0xfd, 0xf4];
const SOFTEN = [0.4, 0.2, 0.12]; // light, mid, dark

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
  const blurRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const blur = blurRef.current!;
    const bctx = blur.getContext('2d')!;
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
      const tones = a.map((c, k) => c.map((v, ch) => {
        const mixed = v + (b[k][ch] - v) * f;
        return Math.round(mixed + (PAGE[ch] - mixed) * SOFTEN[k]);
      }));
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
          const val = n * 0.35 + smooth(0.26, 0.74, r) * 0.65 - 0.15; // clear around the face
          const q = Math.min(2, Math.max(0, Math.floor(val * 2 + BAYER[(y & 3) * 4 + (x & 3)])));
          const c = tones[q];
          const o = (y * size + x) * 4;
          d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      bctx.clearRect(0, 0, size, size);
      bctx.drawImage(canvas, 0, 0);
    };

    const fit = () => {
      const css = wrap.clientWidth;
      size = Math.max(16, Math.round(css / (css >= 140 ? 3 : 2)));
      canvas.width = canvas.height = size;
      blur.width = blur.height = size;
      img = ctx.createImageData(size, size);
      draw();
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      clock += (Math.max(0, now - prev) / 1000) * speed; // rAF time can trail performance.now()
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
    <div ref={wrapRef} className={`relative shrink-0 ${className}`}>
      {/* Blurred copy behind, crisp dither in the middle, everything fading out at the edges */}
      <div aria-hidden className="avatar-fade absolute inset-0">
        <canvas ref={blurRef} className="absolute inset-0 h-full w-full blur-[5px]" />
        <canvas ref={canvasRef} className="avatar-crisp absolute inset-0 h-full w-full [image-rendering:pixelated]" />
      </div>
      <Image src="/avatar.svg" alt="Faiaz Azmain Avatar" fill priority sizes="168px" className="relative object-contain p-[6%]" />
    </div>
  );
}
