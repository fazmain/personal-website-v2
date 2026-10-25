'use client';

import { useEffect, useState } from 'react';
import { getArtwork } from '@/lib/art';
import PieceFrame from './PieceFrame';

const TOTAL = 4294967296; // 2^32 seeds; seed 0 is the original drawing

function newSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0] || 1;
}

/**
 * The Self Portrait, drawn new on every visit (and every refresh). The seed is
 * picked in the browser and never saved anywhere.
 */
export default function SelfPortrait({ className = '' }: { className?: string }) {
  const piece = getArtwork('self-portrait')!;
  const [seed, setSeed] = useState<number | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setSeed(newSeed()));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <figure className={`flex flex-col gap-3 ${className}`}>
      <div className="w-full aspect-[800/920] bg-white/[0.03]">
        {seed !== null && (
          <PieceFrame piece={piece} src={`${piece.src}?seed=${seed}`} className="h-full" />
        )}
      </div>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-3 font-mono text-sm tracking-wide text-[var(--foreground)]/55">
        <span>{seed === null ? ' ' : `No. ${seed.toLocaleString('en-US')} of ${TOTAL.toLocaleString('en-US')}`}</span>
        <button
          type="button"
          onClick={() => setSeed(newSeed())}
          className="uppercase tracking-[0.2em] hover:text-[var(--foreground)] transition-colors"
        >
          another side ↻
        </button>
      </figcaption>
    </figure>
  );
}
