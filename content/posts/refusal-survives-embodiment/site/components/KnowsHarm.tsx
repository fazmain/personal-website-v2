'use client'
import { useMemo, useState } from 'react'
import { Plot, Select, Stat, tokens, useFacts, type PlotModule } from '@/components/kit'
import data from '../../data/transfer_auroc.json'

type View = 'chat' | 'robot_instruction' | 'robot_prompt'

type Row = { layer: number; model: string; auroc: number; sd?: number; position?: string }

const VIEWS: { value: View; label: string }[] = [
  { value: 'chat', label: 'Chat prompts' },
  { value: 'robot_instruction', label: 'Robot commands, at the instruction words' },
  { value: 'robot_prompt', label: 'Robot commands, at the end of the prompt' },
]

const NAME: Record<string, string> = { parent: 'parent VLM', nora: 'NORA (robot policy)' }
const COLOUR: Record<string, string> = { parent: tokens.series[0], nora: tokens.series[1] }

function rows(view: View): Row[] {
  if (view === 'chat') return data.chat as Row[]
  const pos = view === 'robot_instruction' ? 'last_instruction' : 'last_prompt'
  return (data.robot as Row[]).filter(r => r.position === pos)
}

export default function KnowsHarm() {
  const [view, setView] = useState<View>('chat')
  const facts = useFacts()
  const series = rows(view)
  const peak = (m: string) => series.filter(r => r.model === m).reduce((a, r) => (r.auroc > a.auroc ? r : a))
  const options = useMemo(() => {
    const pts = rows(view)
    return (P: PlotModule) => ({
      marginRight: 16,
      x: { label: 'layer', domain: [0, 35] },
      y: { label: 'AUROC, harmful vs harmless', domain: [0.3, 1.0], grid: true },
      color: { domain: ['parent', 'nora'], range: [COLOUR.parent, COLOUR.nora], legend: true, tickFormat: (d: string) => NAME[d] },
      marks: [
        P.ruleY([0.5], { stroke: tokens.fgMuted, strokeDasharray: '2,3' }),
        ...(view === 'chat'
          ? []
          : [P.areaY(pts, { x: 'layer', y1: (d: Row) => d.auroc - (d.sd ?? 0), y2: (d: Row) => d.auroc + (d.sd ?? 0), fill: 'model', fillOpacity: 0.12 })]),
        P.lineY(pts, { x: 'layer', y: 'auroc', stroke: 'model', strokeWidth: 2 }),
        P.dot(pts, { x: 'layer', y: 'auroc', fill: 'model', r: 2.5, tip: true, title: (d: Row) => `${NAME[d.model]}\nlayer ${d.layer}\nAUROC ${d.auroc.toFixed(2)}` }),
      ],
    })
  }, [view])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Select label="What we read" options={VIEWS} value={view} onChange={setView} />
      </div>
      <Plot options={options} height={320} ariaLabel="AUROC by layer for the parent model and the robot policy" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="parent, peak" value={peak('parent').auroc.toFixed(2)} sub={`layer ${peak('parent').layer}`} />
        <Stat label="NORA, peak" value={peak('nora').auroc.toFixed(2)} sub={`layer ${peak('nora').layer}`} />
        <Stat label="probe on NORA, held-out harm type" value={facts.probe_auroc?.display ?? '0.84'} sub="AUROC, cross-fit" />
        <Stat label="episodes base NORA refused" value={`${facts.base230_refuse?.display ?? '0'} of ${facts.base230_n?.display ?? '230'}`} sub="reporting set" />
      </div>
    </div>
  )
}
