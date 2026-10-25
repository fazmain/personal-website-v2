'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { experiments, works } from '@/lib/art';

/**
 * The only navigation in the art section: a way home on the left and a Works
 * menu on the right.
 */
export default function ArtBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the menu after navigating (adjusting state during render, not in an effect).
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const item = (href: string, label: string, sub?: string) => (
    <li key={href}>
      <Link
        href={href}
        aria-current={pathname === href ? 'page' : undefined}
        className={`group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-1 ${pathname === href ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'}`}
      >
        <span className="text-3xl md:text-5xl tracking-tight group-hover:italic">{label}</span>
        {sub && <span className="font-mono text-sm text-[var(--foreground)]/45">{sub}</span>}
      </Link>
    </li>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-4 md:px-10 py-3 md:py-4 bg-[var(--background)]/85 backdrop-blur-md border-b border-[var(--foreground)]/10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--foreground)]/30 px-4 py-2 text-base md:text-lg leading-none text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
        >
          <span aria-hidden>←</span> Home
        </Link>
        <button
          type="button"
          onClick={() => {
            setOpenedAt(pathname);
            setOpen(o => !o);
          }}
          aria-expanded={open}
          aria-controls="art-works-menu"
          className="rounded-full px-4 py-2 font-mono text-sm md:text-base uppercase tracking-[0.15em] text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors"
        >
          {open ? 'Close ✕' : 'Works ▾'}
        </button>
      </header>

      {open && (
        <nav
          id="art-works-menu"
          aria-label="Works"
          className="fixed inset-0 z-40 overflow-y-auto bg-[var(--background)]/97 backdrop-blur-sm px-5 md:px-10 pt-24 pb-16 art-menu-in"
        >
          <div className="mx-auto max-w-5xl grid gap-12 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-[var(--foreground)]/50">Works</p>
              <ul className="flex flex-col gap-1">
                {item('/art', 'Art', 'index')}
                {works().map(w => item(`/art/${w.slug}`, w.title, String(w.year)))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-[var(--foreground)]/50">Experiments</p>
              <ul className="flex flex-col gap-1">{experiments().map(w => item(`/art/${w.slug}`, w.title, String(w.year)))}</ul>
              <p className="mt-10 font-mono text-sm uppercase tracking-[0.2em] text-[var(--foreground)]/50">Elsewhere</p>
              <ul className="flex flex-col gap-1">{item('/', 'Home', 'the other side')}</ul>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
