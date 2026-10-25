'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadPortrait, PORTRAIT_SRC, portraitPointCount } from './portal/portrait';
import { PAPER, playIntro } from './portal/intro';
import { playOutro } from './portal/outro';
import { ArrivalContext } from './arrival';

type Leaving = { x: number; y: number; href: string };

const SEEN_KEY = 'art-portal-seen';
const isArtPath = (path: string) => path === '/art' || path.startsWith('/art/');

/**
 * Everything under /art lives in a different world: dark, and entered through
 * the portal animation. Mounted by app/art/layout.tsx, so the portal plays on
 * every entry to /art (from a link or a direct visit) but not between /art pages.
 */
export default function ArtWorld({ children, chrome }: { children: React.ReactNode; chrome?: React.ReactNode }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useRef<{ skip(): void; destroy(): void } | null>(null);
  const seenBefore = useRef<boolean | null>(null);
  const [intro, setIntro] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [calm, setCalm] = useState(false);
  const [leaving, setLeaving] = useState<Leaving | null>(null);

  // Switch the whole site (nav, footer, background) into the dark palette.
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.world = 'art';
    return () => {
      delete html.dataset.world;
    };
  }, []);

  // The way in.
  useEffect(() => {
    const html = document.documentElement;
    const canvas = canvasRef.current;
    let cancelled = false;
    html.style.overflow = 'hidden';
    const end = () => {
      html.style.overflow = '';
      setIntro(false);
    };

    if (seenBefore.current === null) {
      try {
        seenBefore.current = sessionStorage.getItem(SEEN_KEY) === '1';
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        seenBefore.current = false;
      }
    }

    if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // A plain cross-fade from paper to dark, starting on the next frame.
      const raf = requestAnimationFrame(() => {
        setCalm(true);
        setRevealed(true);
      });
      const id = setTimeout(end, 800);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(id);
        html.style.overflow = '';
      };
    }

    loadPortrait(PORTRAIT_SRC, portraitPointCount()).then(portrait => {
      if (cancelled) return;
      controller.current = playIntro({
        canvas,
        portrait,
        speed: seenBefore.current ? 1.7 : 1,
        onReveal: () => setRevealed(true),
        onDone: end,
      });
    });

    return () => {
      cancelled = true;
      controller.current?.destroy();
      controller.current = null;
      html.style.overflow = '';
    };
  }, []);

  // Skip with any key.
  useEffect(() => {
    if (!intro) return;
    const onKey = () => controller.current?.skip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [intro]);

  // The way out: intercept links that leave /art and close the portal first.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || isArtPath(url.pathname)) return;

      e.preventDefault();
      e.stopPropagation();
      const href = url.pathname + url.search + url.hash;
      router.prefetch(href);
      // Keyboard activation has no pointer position; grow from the link instead.
      const box = a.getBoundingClientRect();
      const x = e.detail === 0 ? box.left + box.width / 2 : e.clientX;
      const y = e.detail === 0 ? box.top + box.height / 2 : e.clientY;
      setLeaving({ x, y, href });
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!leaving || !canvas) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(leaving.href);
      return;
    }
    const stop = playOutro(canvas, leaving.x, leaving.y, () => router.push(leaving.href));
    // If navigation stalls, never leave the visitor stuck behind the paper.
    const bail = setTimeout(() => setLeaving(null), 5000);
    return () => {
      stop();
      clearTimeout(bail);
    };
  }, [leaving, router]);

  const showOverlay = intro || leaving !== null;

  return (
    <>
      {showOverlay && (
        <div
          className="art-portal fixed inset-0 z-[100] cursor-pointer"
          onClick={() => controller.current?.skip()}
        >
          <canvas
            ref={canvasRef}
            aria-hidden
            className={`absolute inset-0 h-full w-full ${calm ? 'opacity-0 transition-opacity duration-700' : ''}`}
            style={{ background: leaving ? 'transparent' : PAPER }}
          />
          {intro && !calm && (
            <button
              type="button"
              onClick={() => controller.current?.skip()}
              className="absolute bottom-5 right-6 font-mono text-xs tracking-widest text-[#8a8478] hover:text-[#ece6da] mix-blend-difference"
            >
              skip ↵
            </button>
          )}
          <span className="sr-only">Entering the art section</span>
        </div>
      )}
      <ArrivalContext.Provider value={!intro}>
        {/* Fixed navigation stays outside the animated wrapper: a transform there would unpin it. */}
        {revealed && <div className="art-chrome-in">{chrome}</div>}
        <div className={revealed ? 'art-arrive' : 'opacity-0'}>{children}</div>
      </ArrivalContext.Provider>
    </>
  );
}
