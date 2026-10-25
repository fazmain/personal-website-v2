'use client';

import { useEffect } from 'react';

/**
 * Everything under /art lives in a different world: dark, with its own
 * navigation. Entering is a plain fade from the cream of the main site.
 * The dark palette also applies from CSS alone (`html:has(.art-world)`), so
 * there is no flash of the cream page before JavaScript runs.
 */
export default function ArtWorld({ children, chrome }: { children: React.ReactNode; chrome?: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.world = 'art';
    return () => {
      delete html.dataset.world;
    };
  }, []);

  return (
    <div className="art-world">
      {/* The plain transition: a cream veil that fades away. Pure CSS, never blocks clicks. */}
      <div aria-hidden className="art-veil pointer-events-none fixed inset-0 z-[100] bg-[#fffdf4]" />
      {chrome}
      <div className="art-arrive">{children}</div>
    </div>
  );
}
