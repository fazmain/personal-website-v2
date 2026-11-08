'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const OPEN_DELAY = 120;
const CLOSE_DELAY = 160;
const GAP = 10; // px between trigger and card
const EDGE = 12; // px kept clear of the viewport edge

type Pos = { left: number; top: number; above: boolean };

/**
 * A small preview card that appears when the pointer rests on `children`.
 * Only shown on devices that can hover; on touch, the link just works as a link.
 * The card is portalled to <body> and positioned with `fixed`, so it never gets
 * clipped by an `overflow: hidden` parent.
 */
export default function HoverCard({ children, card }: { children: ReactNode; card: ReactNode }) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);

  const show = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setPos(null); // re-measure from scratch next time
  }, []);

  const schedule = useCallback((next: boolean) => {
    clearTimeout(timer.current);
    if (next && !window.matchMedia('(hover: hover)').matches) return;
    timer.current = setTimeout(() => show(next), next ? OPEN_DELAY : CLOSE_DELAY);
  }, [show]);

  const place = useCallback(() => {
    const t = triggerRef.current?.getBoundingClientRect();
    const c = cardRef.current;
    if (!t || !c) return;
    const w = c.offsetWidth;
    const h = c.offsetHeight;
    // Centre on the part of the trigger the pointer is most likely on (first line if it wraps).
    const rects = triggerRef.current!.getClientRects();
    const line = rects[0] ?? t;
    const centre = line.left + line.width / 2;
    const left = Math.min(Math.max(centre - w / 2, EDGE), window.innerWidth - w - EDGE);
    const above = line.top - GAP - h >= EDGE;
    const top = above ? line.top - GAP - h : line.bottom + GAP;
    setPos({ left, top, above });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && show(false);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, place, show]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span
      ref={triggerRef}
      onMouseEnter={() => schedule(true)}
      onMouseLeave={() => schedule(false)}
      onClick={() => { clearTimeout(timer.current); show(false); }}
    >
      {children}
      {open && createPortal(
        <div
          ref={cardRef}
          onMouseEnter={() => schedule(true)}
          onMouseLeave={() => schedule(false)}
          data-side={pos?.above === false ? 'below' : 'above'}
          style={{
            position: 'fixed',
            left: pos?.left ?? 0,
            top: pos?.top ?? 0,
            visibility: pos ? 'visible' : 'hidden',
          }}
          className="hover-card z-[60] w-max max-w-[min(20rem,calc(100vw-24px))] rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-3 text-sm leading-snug text-[var(--foreground)] shadow-[0_8px_30px_-12px_rgba(28,35,49,0.35)]"
        >
          {card}
        </div>,
        document.body,
      )}
    </span>
  );
}
