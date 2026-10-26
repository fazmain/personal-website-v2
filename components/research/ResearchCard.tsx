import Link from 'next/link';
import { ResearchEntry, ME, entryHref, kindLabel, isPaper } from '@/lib/research';

export function Authors({ authors }: { authors: string[] }) {
  return (
    <>
      {authors.map((a, i) => (
        <span key={a}>
          {a === ME ? <strong className="font-semibold text-[var(--foreground)]/90">{a}</strong> : a}
          {i < authors.length - 1 && ', '}
        </span>
      ))}
    </>
  );
}

export default function ResearchCard({ entry }: { entry: ResearchEntry }) {
  const href = entryHref(entry);
  const external = !href.startsWith('/');
  const title = (
    <span className="text-base md:text-lg leading-snug text-[var(--accent)] group-hover:underline underline-offset-4 decoration-[var(--accent)]/40">
      {entry.title}
    </span>
  );

  const body = (
    <>
      {title}
      <span className="text-sm text-[var(--foreground)]/70 leading-relaxed">
        <Authors authors={entry.authors} />
      </span>
      <span className="text-sm text-[var(--foreground)]/60">
        {!isPaper(entry) && <span className="italic text-[var(--accent)]/80">{kindLabel[entry.kind]} · </span>}
        {entry.venue ? `${entry.venue}, ` : ''}
        {entry.year}
      </span>
      {entry.summary && (
        <span className="text-sm text-[var(--foreground)]/70 leading-relaxed mt-1">{entry.summary}</span>
      )}
    </>
  );

  const className =
    'group flex flex-col gap-1 rounded-md border border-[var(--foreground)]/10 bg-[var(--foreground)]/[0.025] px-5 py-4 hover:border-[var(--accent)]/30 hover:bg-[var(--foreground)]/[0.04] transition-colors';

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
