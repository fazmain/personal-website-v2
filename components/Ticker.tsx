'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

// News strip across the top of the homepage. Edit `items` to change it; empty it to hide the strip.
const items = [
  'New paper: Refusal Survives Embodiment, at the SPAIS workshop @ CoRL 2026',
  'Looking for funding to keep doing robot safety research',
  'Building a sculpture that lights up with a language model’s thoughts',
];

export default function Ticker() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  if (pathname !== '/' || !open || items.length === 0) return null;

  const run = (copy: number) => (
    <span aria-hidden={copy > 0 || undefined} className="flex shrink-0 items-center">
      {items.map(item => (
        <span key={item} className="flex items-center">
          <span className="px-6">{item}</span>
          <span className="text-[var(--accent)]">✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <div
      role="region"
      aria-label="News"
      className="self-stretch -mt-8 md:-mt-12 -mx-6 md:-mx-12 lg:-mx-24 mb-8 md:mb-12 flex items-stretch bg-[var(--foreground)] text-[var(--background)] font-mono text-xs md:text-sm uppercase tracking-wider"
    >
      <div className="relative flex-1 overflow-hidden py-2.5">
        <div className="ticker-track flex w-max">
          {run(0)}
          {run(1)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss news"
        className="shrink-0 px-4 border-l border-[var(--background)]/20 hover:text-[var(--accent)] transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
