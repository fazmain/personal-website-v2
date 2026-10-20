'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Shows the static fallback image until the reader scrolls near it, then swaps
 * in the live component. Server HTML, RSS and no-JS readers get the image.
 */
export default function Interactive({ fallback, alt, height, children }: {
  fallback: string;
  alt: string;
  height?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setLive(true);
        observer.disconnect();
      }
    }, { rootMargin: '400px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={height ? { minHeight: height } : undefined}>
      {live ? children : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fallback} alt={alt} className="w-full h-auto" />
      )}
    </div>
  );
}
