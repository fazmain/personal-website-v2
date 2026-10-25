// Single source of truth for all research. The Research page, Publications
// page, homepage, and each entry's page header all read from this list.
//
// To add an entry:
//   1. Add an object below.
//   2. If it has its own page (hasPage: true), create app/(site)/research/<slug>/page.tsx
//      by copying app/(site)/research/_template/page.tsx.
//   Entries without a page link straight to their paper / external post.
//
// Posts imported from research repos (content/posts/<slug>/, see POSTS.md) are
// added automatically: allResearch() merges them with the list below.

import { getPosts, toResearchEntry } from '@/lib/posts';

export type ResearchKind =
  | 'preprint'   // arXiv preprint
  | 'conference' // conference or workshop paper
  | 'sprint'     // short personal research sprint, written up here
  | 'extended';  // longer, LessWrong-style research write-up

export interface ResearchEntry {
  slug: string;
  title: string;
  authors: string[];
  kind: ResearchKind;
  /** e.g. "arXiv preprint arXiv:2512.12443", "NeurIPS 2026 Workshop on ...", "LessWrong" */
  venue?: string;
  year: number;
  summary?: string;
  /** Show on the homepage. */
  selected?: boolean;
  /** True when app/(site)/research/<slug>/page.tsx exists. */
  hasPage?: boolean;
  links?: {
    arxiv?: string;
    pdf?: string;
    conference?: string;
    lesswrong?: string;
    code?: string;
    data?: string;
  };
}

export const ME = 'Faiaz Azmain';

export const research: ResearchEntry[] = [
  {
    slug: 'ai-transparency-atlas',
    title: 'AI Transparency Atlas: Framework, Scoring, and Real-Time Model Card Evaluation Pipeline',
    authors: ['Faiaz Azmain', 'Hanyu Wang', 'Akhmadillo Mamirov'],
    kind: 'preprint',
    venue: 'arXiv preprint arXiv:2512.12443',
    year: 2025,
    selected: true,
    links: { arxiv: 'https://arxiv.org/abs/2512.12443', pdf: 'https://arxiv.org/pdf/2512.12443' },
  },
  {
    slug: 'sentiment-analysis-se-gpt',
    title: 'Sentiment Analysis in Software Engineering: Evaluating Generative Pre-trained Transformers',
    authors: ['Faiaz Azmain', 'KM Khalid Saifullah', 'Habiba Hye'],
    kind: 'preprint',
    venue: 'arXiv preprint arXiv:2505.14692',
    year: 2025,
    selected: true,
    links: { arxiv: 'https://arxiv.org/abs/2505.14692', pdf: 'https://arxiv.org/pdf/2505.14692' },
  },
];

export const kindLabel: Record<ResearchKind, string> = {
  preprint: 'Preprint',
  conference: 'Conference',
  sprint: 'Sprint',
  extended: 'Deep dive',
};

export const isPaper = (e: ResearchEntry) => e.kind === 'preprint' || e.kind === 'conference';

/** Where clicking an entry goes: its own page if it has one, else the paper / post. */
export function entryHref(e: ResearchEntry): string {
  if (e.hasPage) return `/research/${e.slug}`;
  const l = e.links ?? {};
  return l.conference ?? l.arxiv ?? l.pdf ?? l.lesswrong ?? l.code ?? `/research/${e.slug}`;
}

/** Hand-written entries plus imported research posts. */
export function allResearch(): ResearchEntry[] {
  const imported = getPosts().map(toResearchEntry);
  const clash = imported.find(p => research.some(e => e.slug === p.slug));
  if (clash) throw new Error(`Research slug "${clash.slug}" is used by both lib/research.ts and content/posts/`);
  return [...research, ...imported];
}

export function getEntry(slug: string): ResearchEntry {
  const entry = allResearch().find(e => e.slug === slug);
  if (!entry) throw new Error(`No research entry with slug "${slug}" in lib/research.ts`);
  return entry;
}

const byYearDesc = (a: ResearchEntry, b: ResearchEntry) => b.year - a.year;

export const papers = () => allResearch().filter(isPaper).sort(byYearDesc);
export const researchPosts = () => allResearch().filter(e => !isPaper(e)).sort(byYearDesc);
