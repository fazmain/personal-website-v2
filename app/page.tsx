import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
// Selected research is hidden for now. Uncomment these, `selected`, and the section below to bring it back.
// import ResearchCard from '@/components/research/ResearchCard';
// import { research } from '@/lib/research';
// Notes are hidden for now. Uncomment these, `starredNotes`, and the Notes section below to bring them back.
// import { getNotes } from '@/lib/notes';
// import NotesTimeline from '@/components/NotesTimeline';

const EMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=fazmain25@gmail.com';

// What I'm working on right now. Change `updated` (YYYY-MM) whenever you edit the text.
const now = {
  updated: '2026-10',
  text: "I'm researching the safety of robot foundation models, looking at how their failure modes are similar to and different from those of LLMs. I'm also looking for funding and opportunities to continue this research at a larger scale. Alongside that, I'm making an interactive sculpture that visualizes residual stream activations!",
};

const nowUpdated = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${now.updated}-01T00:00:00Z`));

// The intro "types" itself out one token at a time, like a model sampling.
const intro: { text: string; href?: string }[] = [
  { text: 'I ' },
  { text: 'research', href: '/research' },
  { text: ' AI safety,' },
  { text: ' ' },
  { text: 'build', href: '/projects' },
  { text: ' fun' },
  { text: ' (and' },
  { text: ' useful)' },
  { text: ' things,' },
  { text: ' and' },
  { text: ' make' },
  { text: ' interactive' },
  { text: ' art.' },
];
const TOKEN_START = 0.5; // seconds
const TOKEN_STEP = 0.11;

const socials = [
  { label: 'email', href: EMAIL },
  { label: 'github', href: 'https://github.com/fazmain' },
  { label: 'x', href: 'https://x.com/faiazAz' },
  { label: 'scholar', href: 'https://scholar.google.com/citations?user=tARzRWgAAAAJ' },
];

const faq: { q: string; a: ReactNode }[] = [
  {
    q: 'What are you working on?',
    a: (
      <>
        Robot foundation model safety. My latest paper, <Link href="/research/refusal-survives-embodiment" className="underline underline-offset-4 decoration-[var(--accent)]/50 hover:decoration-[var(--accent)]">Refusal Survives Embodiment</Link>,
        shows that a robot policy fine-tuned from a safety-tuned model still knows which commands are harmful, but stops refusing them.
      </>
    ),
  },
  {
    q: 'Are you looking for funding or a role?',
    a: (
      <>
        Yes. I&apos;m an independent researcher right now and would love to keep doing this at a larger scale.
        Grants, fellowships, labs: <a href={EMAIL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-[var(--accent)]/50 hover:decoration-[var(--accent)]">tell me about it</a>.
      </>
    ),
  },
  {
    q: 'AI safety and art? Pick one.',
    a: "I'd rather not. Both are ways of looking inside things that are hard to see. The research asks what a model knows; the art tries to make that something you can stand next to.",
  },
  {
    q: 'Where are you based?',
    a: 'Boulder, Colorado. Happy to meet in person or talk remotely.',
  },
  {
    q: "What's the best way to reach you?",
    a: (
      <>
        <a href={EMAIL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-[var(--accent)]/50 hover:decoration-[var(--accent)]">Email</a>.
        I read everything and reply to most of it.
      </>
    ),
  },
];

const bracket = 'font-mono text-sm md:text-base whitespace-nowrap px-1 -mx-1 transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]';

export default function Home() {
  // const selected = research.filter(e => e.selected);
  // const starredNotes = getNotes().filter(note => note.starred);
  const caretDelay = TOKEN_START + intro.length * TOKEN_STEP;

  return (
    <div className="flex flex-col gap-20 md:gap-28 pt-0 pb-8 md:pt-2 md:pb-12">
      {/* Hero */}
      <section className="post-wide flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-6 sm:gap-12 lg:gap-20">
          <h1 className="display text-[22vw] sm:text-[clamp(5rem,13vw,9.5rem)]">
            Hello,<br />this is<br />
            <Link href="/about" className="text-[var(--accent)] hover:underline decoration-4 underline-offset-8">Faiaz.</Link>
          </h1>
          <AnnotatedPortrait />
        </div>

        <p className="font-mono text-base md:text-xl leading-relaxed max-w-2xl" aria-label={intro.map(t => t.text).join('')}>
          <span aria-hidden className="text-[var(--accent)]">&gt; </span>
          <span aria-hidden>
            {intro.map((tok, i) => {
              const style = { animationDelay: `${TOKEN_START + i * TOKEN_STEP}s` };
              return tok.href ? (
                <Link key={i} href={tok.href} style={style} className="token underline underline-offset-4 decoration-[var(--accent)] decoration-2 hover:text-[var(--accent)]">
                  {tok.text}
                </Link>
              ) : (
                <span key={i} style={style} className="token whitespace-pre-wrap">{tok.text}</span>
              );
            })}
            <span className="caret text-[var(--accent)]" style={{ animationDelay: `${caretDelay}s` }}>▌</span>
          </span>
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[var(--foreground)]">
            <Link href="/research" className={`${bracket} font-medium`}>[ read the research ]</Link>
            <Link href="/essays" className={bracket}>[ essays ]</Link>
            <a href={EMAIL} target="_blank" rel="noopener noreferrer" className={`${bracket} text-[var(--accent)]`}>[ say hi ]</a>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs md:text-sm uppercase tracking-wider text-[var(--foreground)]/55">
            {socials.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Now */}
      <section className="flex flex-col gap-5" aria-labelledby="now-heading">
        <h2 id="now-heading" className="display text-6xl md:text-8xl">
          Now<span className="text-[var(--accent)]">.</span>
        </h2>
        <p className="text-lg md:text-2xl leading-relaxed text-[var(--foreground)]/85">{now.text}</p>
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--foreground)]/50">
          Updated <time dateTime={now.updated}>{nowUpdated}</time>
        </p>
      </section>

      {/* Before you ask */}
      <section className="flex flex-col gap-8" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="display text-6xl md:text-8xl">
          Before you ask<span className="text-[var(--accent)]">…</span>
        </h2>
        <ol className="flex flex-col">
          {faq.map(({ q, a }, i) => (
            <li key={q} className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[3.5rem_1fr] gap-x-2 border-t border-[var(--foreground)]/15 py-6">
              <span className="font-mono text-sm text-[var(--accent)] pt-1 md:pt-2">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex flex-col gap-2">
                <h3 className="display text-2xl md:text-4xl leading-none">{q}</h3>
                <p className="text-base md:text-lg leading-relaxed text-[var(--foreground)]/80">{a}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Selected research (hidden for now)
      <section className="flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[var(--accent)]">Selected research</h2>
        {selected.map(e => <ResearchCard key={e.slug} entry={e} />)}
        <Link href="/research" className="text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30 flex items-center gap-1 w-fit mt-1">
          All research <span className="opacity-70">→</span>
        </Link>
      </section>
      */}

      {/* Notes (hidden for now)
      <section className="flex flex-col gap-6" aria-labelledby="notes-heading">
        <h2 id="notes-heading" className="text-xl md:text-2xl font-medium tracking-tight text-[var(--accent)]">Notes</h2>
        {starredNotes.length > 0 && <NotesTimeline notes={starredNotes} />}
        <Link href="/notes" className="w-fit text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30">
          All notes <span aria-hidden="true">→</span>
        </Link>
      </section>
      */}
    </div>
  );
}

// The line portrait with red marker scribbled over it: a loop, an arrow, a few sparks and a note.
function AnnotatedPortrait() {
  const draw = (delay: number) => ({ animationDelay: `${delay}s` });
  return (
    <div className="relative self-end sm:self-auto w-40 sm:w-52 md:w-64 shrink-0 aspect-[200/230]">
      <Image src="/avatar.svg" alt="Line drawing of Faiaz" width={200} height={217} className="absolute left-[8%] top-[10%] w-[80%] h-auto" priority />
      <svg viewBox="0 0 200 230" className="marker absolute inset-0 w-full h-full overflow-visible pointer-events-none" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {/* loop around the head */}
        <path pathLength={1} style={draw(1.6)} d="M150 40 C 128 10, 52 12, 34 58 C 18 100, 40 150, 92 156 C 146 162, 176 120, 168 76 C 162 46, 140 30, 112 28" />
        {/* sparks */}
        <path pathLength={1} style={draw(2.2)} d="M176 22 L 186 8" />
        <path pathLength={1} style={draw(2.3)} d="M182 36 L 198 32" />
        <path pathLength={1} style={draw(2.4)} d="M164 14 L 166 0" />
        {/* arrow up to the loop */}
        <path pathLength={1} style={draw(2.6)} d="M70 214 C 52 200, 46 186, 56 166" />
        <path pathLength={1} style={draw(3.0)} d="M46 176 L 56 164 L 66 174" />
      </svg>
      <span className="marker-note absolute -bottom-1 left-[42%] font-hand text-2xl md:text-3xl text-[var(--accent)] -rotate-6 whitespace-nowrap" style={draw(3.1)}>
        that&apos;s me!
      </span>
    </div>
  );
}
