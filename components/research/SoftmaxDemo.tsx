'use client';

import { useState } from 'react';

// Example interactive demo: how temperature reshapes a next-token distribution.
const tokens = [
  { token: 'the', logit: 3.2 },
  { token: 'a', logit: 2.6 },
  { token: 'this', logit: 1.9 },
  { token: 'my', logit: 1.1 },
  { token: 'every', logit: 0.4 },
];

export default function SoftmaxDemo() {
  const [temperature, setTemperature] = useState(1);

  const exps = tokens.map(t => Math.exp(t.logit / temperature));
  const total = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map(e => e / total);

  return (
    <div className="flex flex-col gap-5">
      <label className="flex items-center gap-4 text-sm text-[var(--foreground)]/70">
        <span className="shrink-0">Temperature</span>
        <input
          type="range"
          min={0.1}
          max={3}
          step={0.05}
          value={temperature}
          onChange={e => setTemperature(Number(e.target.value))}
          className="flex-1 accent-[#ac4c2e]"
        />
        <span className="w-10 text-right tabular-nums font-mono text-xs">{temperature.toFixed(2)}</span>
      </label>
      <ul className="flex flex-col gap-2">
        {tokens.map((t, i) => (
          <li key={t.token} className="flex items-center gap-3 text-sm">
            <span className="w-12 shrink-0 font-mono text-xs text-[var(--foreground)]/70">{t.token}</span>
            <span className="flex-1 h-3 rounded-sm bg-[var(--foreground)]/[0.06] overflow-hidden">
              <span className="block h-full bg-[#ac4c2e]/80 transition-[width] duration-150" style={{ width: `${probs[i] * 100}%` }} />
            </span>
            <span className="w-12 text-right tabular-nums font-mono text-xs text-[var(--foreground)]/60">{(probs[i] * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
