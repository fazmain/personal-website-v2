'use client';

import { useEffect, useRef } from 'react';
import { ART_HEIGHT, createCityscape } from '@/components/cityscape/scene';

const FPS = 12;
const MAX_ART_WIDTH = 460;

export default function CityscapeFooter() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const scene = createCityscape(canvas);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scale = 3;
    let raf = 0;
    let last = -Infinity;
    let visible = true;
    const start = performance.now();

    const draw = (now: number) => scene.frame(still ? 0 : (now - start) / 1000);

    const fit = () => {
      // Whole-number scale so every art pixel is the same size on screen.
      scale = wrap.clientHeight / ART_HEIGHT;
      // Wide screens get a centred scene that fades out at the sides, not a stretched one.
      const width = Math.min(MAX_ART_WIDTH, Math.ceil(wrap.clientWidth / scale));
      scene.resize(width);
      canvas.style.width = `${width * scale}px`;
      canvas.style.height = `${ART_HEIGHT * scale}px`;
      draw(performance.now());
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / FPS) return;
      last = now;
      draw(now);
    };

    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(wrap);
    if (!still) raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      scene.setPointer({ x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale });
      if (still) draw(performance.now());
    };
    const onLeave = () => { scene.setPointer(null); if (still) draw(performance.now()); };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <footer className="relative mt-8 w-screen max-w-none select-none">
      <div ref={wrapRef} className="relative h-[160px] overflow-hidden">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Pixel-art San Francisco at sunset: the Golden Gate Bridge in the fog, Coit Tower, the Transamerica Pyramid, Salesforce Tower, and Sutro Tower on Twin Peaks"
          className="absolute left-1/2 top-0 block -translate-x-1/2 [image-rendering:pixelated] [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]"
        />
      </div>
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 pb-8 pt-2 text-sm font-medium text-[var(--foreground)]/50 md:px-2">
        <span>© {new Date().getFullYear()} Faiaz Azmain. I love big cities; can you tell?</span>
      </div>
    </footer>
  );
}
