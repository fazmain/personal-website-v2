'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { experiments, works } from '@/lib/art';

/**
 * The only navigation in the art section: a way home on the left and a Works
 * menu on the right. Leaving goes through the portal's closing transition.
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
        <span className="text-2xl md:text-4xl tracking-tight group-hover:italic">{label}</span>
        {sub && <span className="font-mono text-[11px] text-[var(--foreground)]/40">{sub}</span>}
      </Link>
    </li>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 md:px-10 py-4 bg-gradient-to-b from-[var(--background)] via-[var(--background)]/80 to-transparent">
        <Link href="/" className="font-mono text-xs tracking-wide text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">
          ← Faiaz Azmain
        </Link>
        <button
          type="button"
          onClick={() => {
            setOpenedAt(pathname);
            setOpen(o => !o);
          }}
          aria-expanded={open}
          aria-controls="art-works-menu"
          className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
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
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--foreground)]/40">Works</p>
              <ul className="flex flex-col gap-1">
                {item('/art', 'Art', 'index')}
                {works().map(w => item(`/art/${w.slug}`, w.title, String(w.year)))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--foreground)]/40">Experiments</p>
              <ul className="flex flex-col gap-1">{experiments().map(w => item(`/art/${w.slug}`, w.title, String(w.year)))}</ul>
              <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--foreground)]/40">Elsewhere</p>
              <ul className="flex flex-col gap-1">{item('/', 'Home', 'the other side')}</ul>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
