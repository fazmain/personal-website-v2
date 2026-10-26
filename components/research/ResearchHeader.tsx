import Link from 'next/link';
import { getEntry, kindLabel } from '@/lib/research';
import { Authors } from './ResearchCard';

const linkLabels = {
  conference: 'Paper',
  arxiv: 'arXiv',
  pdf: 'PDF',
  lesswrong: 'LessWrong',
  code: 'Code',
  data: 'Data',
} as const;

/** Top of every research entry page: title, authors, venue, and paper links. */
export default function ResearchHeader({ slug }: { slug: string }) {
  const entry = getEntry(slug);
  const links = Object.entries(entry.links ?? {}).filter(([, url]) => url) as [keyof typeof linkLabels, string][];

  return (
    <header className="flex flex-col gap-3">
      <Link href="/research" className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-2 mb-4 w-fit">
        <span>←</span> All research
      </Link>
      <span className="text-sm italic text-[var(--accent)]">{kindLabel[entry.kind]}</span>
      <h1 className="text-[clamp(1.625rem,0.5rem+3.5vw,2.25rem)] font-medium tracking-tight leading-tight">{entry.title}</h1>
      <p className="text-base text-[var(--foreground)]/70">
        <Authors authors={entry.authors} />
      </p>
      <p className="text-sm text-[var(--foreground)]/60">
        {entry.venue ? `${entry.venue}, ` : ''}
        {entry.year}
      </p>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {links.map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-1 rounded-full border border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--background)] transition-colors"
            >
              {linkLabels[key]} ↗
            </a>
          ))}
        </div>
      )}
      <hr className="border-[var(--foreground)]/10 mt-6" />
    </header>
  );
}
