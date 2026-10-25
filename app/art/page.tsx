import Image from 'next/image';
import Link from 'next/link';
import ArtText from '@/components/art/ArtText';
import PieceFrame from '@/components/art/PieceFrame';
import SelfPortrait from '@/components/art/SelfPortrait';
import { ART_INTRO, type Artwork, experiments, getArtwork, thumbFor } from '@/lib/art';

export const metadata = {
  title: 'Art — Faiaz Azmain',
  description: 'Interactive pieces made with code: a self-portrait drawn new for every visit, eyes that watch back, two painted decks, and experiments.',
};

const kicker = 'font-mono text-sm uppercase tracking-[0.2em] text-[var(--foreground)]/55';

function Label({ piece, as: Heading = 'h2' }: { piece: Artwork; as?: 'h2' | 'h3' }) {
  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-4xl md:text-6xl tracking-tight leading-[1.05]">
        <Link href={`/art/${piece.slug}`} className="hover:italic">
          {piece.title}
        </Link>
      </Heading>
      <p className="font-mono text-sm text-[var(--foreground)]/55">
        {piece.year} · {piece.medium} · {piece.input}
      </p>
    </div>
  );
}

const more = (piece: Artwork, label = 'more about this piece') => (
  <Link href={`/art/${piece.slug}`} className={`${kicker} w-fit hover:text-[var(--foreground)] transition-colors`}>
    {label} →
  </Link>
);

/** Paragraphs before the first "## " heading: the piece's opening thoughts. */
const opening = (text: string[]) => {
  const i = text.findIndex(p => p.startsWith('## '));
  return i === -1 ? text : text.slice(0, i);
};

export default function ArtPage() {
  const portrait = getArtwork('self-portrait')!;
  const eyes = getArtwork('all-eyes-on-you')!;
  const decks = [getArtwork('never-sleeps')!, getArtwork('almanac')!];

  return (
    <div className="flex flex-col gap-32 md:gap-44">
      {/* Introduction */}
      <section className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:items-end pt-6 md:pt-16">
        <h1 className="text-[clamp(4.5rem,2rem+11vw,11rem)] leading-[0.82] tracking-tight">Art</h1>
        <div className="flex flex-col gap-6 max-w-xl">
          <p className="text-xl md:text-2xl leading-relaxed text-[var(--foreground)]/85">{ART_INTRO.text}</p>
          <dl className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-6 gap-y-1 sm:gap-y-2 font-mono text-sm text-[var(--foreground)]/60">
            <dt className="text-[var(--foreground)]/40">working in</dt>
            <dd>{ART_INTRO.workingIn}</dd>
            <dt className="text-[var(--foreground)]/40 mt-2 sm:mt-0">experimenting with</dt>
            <dd>{ART_INTRO.experimenting}</dd>
          </dl>
        </div>
      </section>

      {/* I. The portrait first: it is an identity piece. */}
      <section className="grid gap-10 md:gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <SelfPortrait className="w-full max-w-[520px] md:justify-self-end" />
        <div className="flex flex-col gap-6 max-w-lg">
          <p className={kicker}>I</p>
          <Label piece={portrait} />
          <ArtText text={portrait.text} />
          {more(portrait)}
        </div>
      </section>

      {/* II. The eyes, with the text beside them rather than full screen. */}
      <section className="grid gap-10 md:gap-16 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.3fr)] md:items-center">
        <div className="flex flex-col gap-6 max-w-lg md:order-1 order-2">
          <p className={kicker}>II</p>
          <Label piece={eyes} />
          <ArtText text={opening(eyes.text)} />
          {more(eyes, 'how the eyes think')}
        </div>
        <div className="flex flex-col gap-2 md:order-2 order-1">
          <PieceFrame piece={eyes} className="aspect-[4/3] bg-black" />
          <p className="font-mono text-sm text-[var(--foreground)]/50">{eyes.hint}</p>
        </div>
      </section>

      {/* III. The decks. */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <p className={kicker}>III</p>
          <h2 className="text-4xl md:text-6xl tracking-tight">Two decks</h2>
          <p className="max-w-xl text-lg md:text-xl text-[var(--foreground)]/75">Two worlds painted as playing cards, each laid on its own table.</p>
        </div>
        <div className="grid gap-10 sm:grid-cols-2">
          {decks.map(deck => (
            <Link key={deck.slug} href={`/art/${deck.slug}`} className="group flex flex-col gap-4">
              <div className="relative aspect-[4/3] overflow-hidden bg-black">
                <Image
                  src={thumbFor(deck.slug)}
                  alt={`${deck.title}, ${deck.year}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover opacity-85 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl tracking-tight group-hover:italic">{deck.title}</span>
                <span className="text-lg text-[var(--foreground)]/75">{deck.summary}</span>
                <span className="font-mono text-sm text-[var(--foreground)]/50">
                  {deck.year} · {deck.medium}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Experiments: unfinished on purpose. */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <p className={kicker}>Experiments</p>
          <h2 className="text-4xl md:text-6xl tracking-tight">Unfinished, on purpose</h2>
          <p className="max-w-xl text-lg md:text-xl text-[var(--foreground)]/75">
            Ideas I am still working out: videos, stills and notes from pieces that may never be finished.
          </p>
        </div>
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {experiments().map(x => (
            <Link key={x.slug} href={`/art/${x.slug}`} className="group flex flex-col gap-4">
              <div className="relative aspect-[4/3] overflow-hidden border border-dashed border-[var(--foreground)]/15 bg-white/[0.02]">
                {x.src ? (
                  <Image
                    src={thumbFor(x.slug)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover opacity-60 transition duration-700 group-hover:opacity-90"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center font-mono text-sm uppercase tracking-[0.2em] text-[var(--foreground)]/40">
                    video soon
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl md:text-3xl tracking-tight group-hover:italic">{x.title}</span>
                <span className="text-lg text-[var(--foreground)]/70">{x.summary}</span>
                <span className="font-mono text-sm text-[var(--foreground)]/50">
                  {x.year} · {x.medium}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="flex flex-wrap justify-between gap-6 border-t border-[var(--foreground)]/10 pt-8 font-mono text-sm text-[var(--foreground)]/55">
        <span>© {new Date().getFullYear()} Faiaz Azmain</span>
        <Link href="/" className="text-base text-[var(--foreground)]/85 underline underline-offset-4 decoration-[var(--foreground)]/30 hover:decoration-[var(--foreground)]">
          ← Back to the home page
        </Link>
      </footer>
    </div>
  );
}
