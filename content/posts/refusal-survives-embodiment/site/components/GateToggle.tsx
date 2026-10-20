'use client'
import { useState } from 'react'
import { Plot, Select, Stat, Toggle, tokens, type PlotModule } from '@/components/kit'
import rows from '../../data/gate_toggle.json'

type Row = { arm: string; label: string; installed: boolean; nt: number; demo: number; ht: number; abort: number; bt: number; lib: number; para: number | null }

const MEASURES: { key: keyof Row; label: string; good: 'high' | 'low' }[] = [
  { key: 'nt', label: 'refuses never-trained harm', good: 'high' },
  { key: 'ht', label: 'refuses harmful twins', good: 'high' },
  { key: 'abort', label: 'stops after a mid-task swap', good: 'high' },
  { key: 'bt', label: 'over-refuses benign twins', good: 'low' },
  { key: 'lib', label: 'LIBERO task success', good: 'high' },
]

const SEEDS = [
  { value: 's0', label: 'seed 0' },
  { value: 's1', label: 'seed 1' },
  { value: 's2', label: 'seed 2' },
]

export default function GateToggle() {
  const [installed, setInstalled] = useState(true)
  const [seed, setSeed] = useState('s1')
  const all = rows as Row[]
  const base = all.find(r => r.arm === 'base')!
  const row = installed ? all.find(r => r.arm === seed)! : base
  const bars = MEASURES.map(m => ({ measure: m.label, value: row[m.key] as number, good: m.good }))

  const options = (() => {
    const data = MEASURES.map(m => ({ measure: m.label, value: row[m.key] as number }))
    // Measure names sit above each bar so the bars keep the full width on a phone.
    return (P: PlotModule) => ({
      marginLeft: 12,
      marginRight: 44,
      marginTop: 4,
      x: { label: 'fraction of episodes', domain: [0, 1], grid: true },
      y: { axis: null, domain: MEASURES.map(m => m.label) },
      marks: [
        P.barX(data, { y: 'measure', x: 'value', fill: installed ? tokens.accent : tokens.fgMuted, rx: 2, insetTop: 24, insetBottom: 4, tip: true, title: (d: { measure: string; value: number }) => `${d.measure}: ${d.value.toFixed(2)}` }),
        P.text(data, { y: 'measure', x: 0, text: 'measure', dy: -12, textAnchor: 'start', fill: tokens.fg, fontSize: 12 }),
        P.text(data, { y: 'measure', x: 'value', text: (d: { value: number }) => d.value.toFixed(2), dx: 6, dy: 10, textAnchor: 'start', fill: tokens.fg, fontSize: 11 }),
      ],
    })
  })()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Toggle label="parent-taught refusal installed" checked={installed} onChange={setInstalled} />
        {installed && <Select label="adapter" options={SEEDS} value={seed} onChange={setSeed} />}
      </div>
      <p className="m-0 text-sm text-[var(--foreground)]/70">{row.label}. Same fresh episodes for every arm; nothing but NORA runs at test time.</p>
      <Plot options={options} height={300} ariaLabel="Refusal, over-refusal and task success for the selected arm" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {bars.filter(b => ['refuses never-trained harm', 'over-refuses benign twins', 'LIBERO task success'].includes(b.measure)).map(b => (
          <Stat key={b.measure} label={b.measure} value={b.value.toFixed(2)} sub={b.measure === 'LIBERO task success' ? `base NORA: ${base.lib.toFixed(2)}` : undefined} />
        ))}
      </div>
    </div>
  )
}
