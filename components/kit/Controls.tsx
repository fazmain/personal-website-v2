'use client';

import { useId } from 'react';

const labelText = 'text-sm text-[var(--foreground)]/70';
const valueText = 'tabular-nums font-mono text-xs text-[var(--foreground)]/70';

export function Slider({ label, min, max, step = 1, value, onChange, format }: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  return (
    <label className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${labelText}`}>
      <span className="shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="min-w-[8rem] flex-1 accent-[#ac4c2e]"
      />
      <span className={`w-14 text-right ${valueText}`}>{format ? format(value) : value}</span>
    </label>
  );
}

export function Toggle({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 ${labelText} hover:text-[var(--foreground)] transition-colors`}
    >
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#ac4c2e]' : 'bg-[var(--foreground)]/20'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-[var(--background)] transition-[left] ${checked ? 'left-[1.125rem]' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  );
}

export function Select<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <span className={`inline-flex items-center gap-2 ${labelText}`}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id} value={value} onChange={e => onChange(e.target.value as T)}
        className="rounded-md border border-[var(--foreground)]/15 bg-[var(--background)] px-2 py-1 text-[var(--foreground)]"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </span>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-[var(--foreground)]/10 px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-[var(--foreground)]/55">{label}</span>
      <span className="text-2xl font-medium tabular-nums text-[#ac4c2e]">{value}</span>
      {sub && <span className="text-xs text-[var(--foreground)]/60">{sub}</span>}
    </div>
  );
}
