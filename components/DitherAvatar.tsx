'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { hexToRgb, mix, readColorVar, rotateHue } from '@/lib/river';

// The tile follows the visit's palette (lib/river.ts): it drifts between the
// accent and its two neighbours on the hue wheel, so the colours never sit
// still but stay in today's family. Three tones per palette: light, mid, dark,
// each pulled part-way toward the page colour so the tile stays soft.
const NEIGHBOUR = 35; // degrees either side of the accent
const SOFTEN = [0.4, 0.2, 0.12]; // light, mid, dark

function palettesFor(accent: string, page: string) {
  const tones = (c: string) =>
    [mix(c, page, 0.88), mix(c, page, 0.5), c].map((t, k) => hexToRgb(mix(t, page, SOFTEN[k])));
  const up = rotateHue(accent, NEIGHBOUR), down = rotateHue(accent, -NEIGHBOUR);
  return [accent, up, accent, down].map(tones);
}

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
    let themeKey = '';
    let palettes: number[][][] = [];

    const draw = () => {
      if (!img) return;
      const t = clock;
      const accent = readColorVar('--accent'), page = readColorVar('--background');
      if (accent + page !== themeKey) { themeKey = accent + page; palettes = palettesFor(accent, page); }
      const phase = t / SECONDS_PER_PALETTE;
      const i = Math.floor(phase) % palettes.length;
      const f = smooth(0.6, 1, phase % 1); // hold, then blend
      const a = palettes[i], b = palettes[(i + 1) % palettes.length];
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
