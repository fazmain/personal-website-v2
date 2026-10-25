import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArtText from '@/components/art/ArtText';
import PieceFrame from '@/components/art/PieceFrame';
import SelfPortrait from '@/components/art/SelfPortrait';
import { type Artwork, artworks, getArtwork, nextArtwork } from '@/lib/art';

export const dynamicParams = false;

export function generateStaticParams() {
  return artworks.map(a => ({ slug: a.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const piece = getArtwork((await props.params).slug);
  return piece ? { title: `${piece.title} — Faiaz Azmain`, description: piece.summary } : {};
}

const kicker = 'font-mono text-sm uppercase tracking-[0.2em] text-[var(--foreground)]/55';

function Header({ piece }: { piece: Artwork }) {
  return (
    <header className="flex flex-col gap-3">
      <p className={kicker}>{piece.kind === 'experiment' ? 'Experiment · unfinished on purpose' : 'Work'}</p>
      <h1 className="text-[clamp(2.5rem,1.5rem+4vw,5rem)] leading-[0.95] tracking-tight">{piece.title}</h1>
      <p className="font-mono text-sm text-[var(--foreground)]/55">
        {piece.year} · {piece.medium} · {piece.input}
      </p>
    </header>
  );
}

function FrameNotes({ piece }: { piece: Artwork }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 font-mono text-sm text-[var(--foreground)]/50">
      <span>{piece.hint ?? ''}</span>
      {/* Opens outside the frame; there the camera pieces may ask for camera access. */}
      <a href={piece.src} target="_blank" rel="noopener" className="hover:text-[var(--foreground)] transition-colors">
        open full screen ↗
      </a>
    </div>
  );
}

/** Empty slots for an experiment's media and notes until they are added. */
function Placeholder({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`grid place-items-center border border-dashed border-[var(--foreground)]/15 bg-white/[0.02] ${className}`}>
      <span className="font-mono text-sm uppercase tracking-[0.2em] text-[var(--foreground)]/40">{label}</span>
    </div>
  );
}

export default async function ArtworkPage(props: { params: Promise<{ slug: string }> }) {
  const piece = getArtwork((await props.params).slug);
  if (!piece) notFound();
  const next = nextArtwork(piece.slug);

  return (
    <article className="flex flex-col gap-14 md:gap-20 pt-6 md:pt-12">
      {piece.kind === 'portrait' && (
        <div className="grid gap-12 md:gap-20 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
          <SelfPortrait className="w-full max-w-[640px] md:sticky md:top-24" />
          <div className="flex flex-col gap-10 max-w-xl">
            <Header piece={piece} />
            <ArtText text={piece.text} />
          </div>
        </div>
      )}

      {piece.kind === 'live' && (
        <>
          <Header piece={piece} />
          <div className="flex flex-col gap-3">
            <PieceFrame
              piece={piece}
              className={`bg-black ${piece.frame === 'screen' ? 'h-[min(82vh,860px)]' : 'aspect-[16/10]'}`}
            />
            <FrameNotes piece={piece} />
          </div>
          <ArtText text={piece.text} className="max-w-2xl" />
        </>
      )}

      {piece.kind === 'experiment' && (
        <>
          <Header piece={piece} />
          <p className="max-w-2xl text-xl md:text-2xl leading-relaxed text-[var(--foreground)]/80">{piece.summary}</p>
          <Placeholder label="video coming soon" className="aspect-video" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Placeholder label="image" className="aspect-[4/3]" />
            <Placeholder label="image" className="aspect-[4/3]" />
            <Placeholder label="image" className="aspect-[4/3]" />
          </div>
          {piece.src && (
            <div className="flex flex-col gap-3">
              <p className={kicker}>A study, running live</p>
              <PieceFrame piece={piece} className="h-[min(78vh,760px)] bg-black" />
              <FrameNotes piece={piece} />
            </div>
          )}
          {piece.text.length > 0 ? (
            <ArtText text={piece.text} className="max-w-2xl" />
          ) : (
            <div className="flex flex-col gap-3 max-w-2xl">
              <p className={kicker}>Notes</p>
              <p className="text-lg text-[var(--foreground)]/55 italic">Notes coming soon.</p>
            </div>
          )}
        </>
      )}

      <nav className="flex flex-wrap items-end justify-between gap-6 border-t border-[var(--foreground)]/10 pt-10">
        <Link href="/art" className={`${kicker} hover:text-[var(--foreground)] transition-colors`}>
          ← all work
        </Link>
        <Link href={`/art/${next.slug}`} className="group flex flex-col items-end gap-1 text-right">
          <span className={kicker}>next</span>
          <span className="text-3xl md:text-5xl tracking-tight group-hover:italic">{next.title} →</span>
        </Link>
      </nav>
    </article>
  );
}
