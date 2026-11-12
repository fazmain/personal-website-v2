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

/**
 * One research entry as a quiet editorial list item (no box), matching the
 * Projects page: the title is the link, then authors, venue and year, and the
 * summary if there is one.
 */
export default function ResearchCard({ entry }: { entry: ResearchEntry }) {
  const href = entryHref(entry);
  const external = !href.startsWith('/');
  const titleClass =
    'w-fit text-base md:text-lg leading-snug text-[#ac4c2e] hover:underline underline-offset-4 decoration-[#ac4c2e]/40';
  const title = external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={titleClass}>
      {entry.title}
      <span aria-hidden className="ml-1 text-sm opacity-60">↗</span>
    </a>
  ) : (
    <Link href={href} className={titleClass}>
      {entry.title}
    </Link>
  );

  return (
    <article className="flex flex-col gap-1.5">
      {title}
      <p className="text-sm md:text-base text-[var(--foreground)]/70 leading-relaxed">
        <Authors authors={entry.authors} />
      </p>
      <p className="text-sm text-[var(--foreground)]/55">
        {!isPaper(entry) && <span className="italic">{kindLabel[entry.kind]} · </span>}
        {entry.venue ? `${entry.venue} · ` : ''}
        {entry.year}
      </p>
      {entry.summary && (
        <p className="mt-1 text-sm md:text-base text-[var(--foreground)]/75 leading-relaxed">{entry.summary}</p>
      )}
    </article>
  );
}
