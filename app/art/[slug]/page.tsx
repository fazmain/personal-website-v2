import Link from 'next/link';
import { notFound } from 'next/navigation';
import PieceFrame from '@/components/art/PieceFrame';
import { SERIES, artworks, bySeries, getArtwork, hasPage } from '@/lib/art';

export const dynamicParams = false;

export function generateStaticParams() {
  return artworks.filter(hasPage).map(a => ({ slug: a.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const piece = getArtwork((await props.params).slug);
  return piece ? { title: `${piece.title} — Faiaz Azmain`, description: piece.summary } : {};
}

export default async function ArtworkPage(props: { params: Promise<{ slug: string }> }) {
  const piece = getArtwork((await props.params).slug);
  if (!piece || !hasPage(piece)) notFound();

  const siblings = piece.series ? bySeries(piece.series) : [];
  const index = siblings.findIndex(s => s.slug === piece.slug);
  const next = siblings.length > 1 ? siblings[(index + 1) % siblings.length] : null;

  return (
    <article className="flex flex-col gap-8 py-8 md:py-12">
      <nav className="flex flex-wrap items-baseline justify-between gap-4 text-sm text-[var(--foreground)]/55">
        <Link href="/art" className="hover:text-[var(--foreground)] transition-colors">← Art</Link>
        {piece.series && next && (
          <span className="font-mono text-xs">
            {SERIES[piece.series].title} · {index + 1} of {siblings.length} ·{' '}
            <Link href={`/art/${next.slug}`} className="hover:text-[var(--foreground)] transition-colors">
              {next.title} →
            </Link>
          </span>
        )}
        {piece.status === 'in-progress' && <span className="font-mono text-xs">in progress</span>}
      </nav>

      <div className="post-wide flex flex-col gap-3">
        <PieceFrame piece={piece} className="h-[min(78vh,760px)] rounded-[2px]" />
        <div className="flex flex-wrap items-baseline justify-between gap-4 font-mono text-xs text-[var(--foreground)]/45">
          <span>{piece.hint ?? ''}</span>
          {/* Opens outside the frame; there the camera pieces may ask for camera access. */}
          <a href={piece.src} target="_blank" rel="noopener" className="hover:text-[var(--foreground)] transition-colors">
            open full screen ↗
          </a>
        </div>
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(1.75rem,1rem+3vw,2.75rem)] font-medium tracking-tight leading-tight">{piece.title}</h1>
        <p className="font-mono text-xs text-[var(--foreground)]/50">
          {piece.year} · {piece.medium} · {piece.input}
        </p>
      </header>

      <div className="flex flex-col gap-4 max-w-xl text-base md:text-lg leading-relaxed text-[var(--foreground)]/80">
        {piece.note.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
