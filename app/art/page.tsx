import Image from 'next/image';
import Link from 'next/link';
import ArtTile from '@/components/art/ArtTile';
import PieceFrame from '@/components/art/PieceFrame';
import { SERIES, type SeriesId, bySeries, getArtwork, hasPage, inProgress, thumbFor } from '@/lib/art';

export const metadata = {
  title: 'Art — Faiaz Azmain',
  description: 'Interactive pieces made with code: eyes that watch back, self-portraits that redraw themselves, and two decks of painted cards.',
};

const label = 'font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--foreground)]/45';

export default function ArtPage() {
  const featured = getArtwork('all-eyes-on-you')!;
  const series: SeriesId[] = ['portraits', 'decks'];

  return (
    <div className="flex flex-col gap-20 py-8 md:py-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-[clamp(2.25rem,1rem+5vw,4rem)] font-medium tracking-tight leading-none">Art</h1>
        <p className="text-base md:text-lg text-[var(--foreground)]/70 max-w-xl leading-relaxed">
          Interactive pieces made with code: eyes that watch back, self-portraits that redraw themselves, and two decks
          of cards painted as places and time. Everything here runs live in your browser.
        </p>
      </header>

      {/* The opening piece runs live on the page. */}
      <section className="post-wide flex flex-col gap-4">
        <PieceFrame piece={featured} className="aspect-[16/10] rounded-[2px]" />
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <Link href={`/art/${featured.slug}`} className="text-xl hover:underline underline-offset-4 decoration-[var(--foreground)]/30">
            {featured.title}
          </Link>
          <span className="font-mono text-xs text-[var(--foreground)]/45">
            {featured.year} · {featured.medium} · {featured.input}
          </span>
        </div>
        <p className="text-sm md:text-base text-[var(--foreground)]/65 max-w-xl">{featured.summary}</p>
      </section>

      {series.map(id => (
        <section key={id} className="post-wide flex flex-col gap-6">
          <h2 className={label}>
            {SERIES[id].title} <span className="normal-case tracking-normal text-[var(--foreground)]/35">· {SERIES[id].blurb}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
            {bySeries(id).map(piece => (
              <ArtTile key={piece.slug} piece={piece} />
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-6">
        <h2 className={label}>In progress</h2>
        <ul className="flex flex-col gap-6">
          {inProgress().map(piece => {
            const body = (
              <>
                <span className="relative block h-14 w-20 shrink-0 overflow-hidden rounded-[2px] bg-white/[0.04]">
                  {hasPage(piece) && (
                    <Image src={thumbFor(piece.slug)} alt="" fill sizes="80px" className="object-cover opacity-80" />
                  )}
                </span>
                <span className="flex flex-col gap-1">
                  <span className={`text-base md:text-lg leading-snug ${hasPage(piece) ? 'group-hover:underline underline-offset-4 decoration-[var(--foreground)]/30' : ''}`}>
                    {piece.title}
                  </span>
                  <span className="text-sm text-[var(--foreground)]/60 leading-relaxed">{piece.summary}</span>
                  <span className="font-mono text-xs text-[var(--foreground)]/40">
                    {piece.medium}
                    {!hasPage(piece) && ' · video coming soon'}
                  </span>
                </span>
              </>
            );
            return (
              <li key={piece.slug}>
                {hasPage(piece) ? (
                  <Link href={`/art/${piece.slug}`} className="group flex gap-4 items-start">{body}</Link>
                ) : (
                  <div className="flex gap-4 items-start">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
