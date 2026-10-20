'use client';

import { useEffect, useRef } from 'react';
import * as PlotLib from '@observablehq/plot';
import { tokens } from './tokens';

export type PlotModule = typeof PlotLib;

/**
 * Observable Plot chart that fills the column width.
 * `options` receives the Plot module and returns Plot options:
 *   <Plot options={(Plot) => ({ marks: [Plot.barY(data, { x: 'k', y: 'v' })] })} />
 */
export function Plot({ options, height, ariaLabel }: {
  options: (Plot: PlotModule) => PlotLib.PlotOptions;
  height?: number;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let width = 0;
    const render = () => {
      if (el.clientWidth === width) return;
      width = el.clientWidth;
      const chart = PlotLib.plot({
        width,
        height,
        ariaLabel,
        style: { background: 'transparent', color: tokens.fg, fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px' },
        ...options(PlotLib),
      });
      el.replaceChildren(chart);
    };
    render();
    // Re-render on width changes only; the chart changing its own height must not loop.
    const observer = new ResizeObserver(render);
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.replaceChildren();
    };
  }, [options, height, ariaLabel]);

  return <div ref={ref} className="w-full" style={height ? { minHeight: height } : undefined} />;
}
