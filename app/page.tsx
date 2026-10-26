import Link from 'next/link';
import Image from 'next/image';
// Selected research is hidden for now. Uncomment these, `selected`, and the section below to bring it back.
// import ResearchCard from '@/components/research/ResearchCard';
// import { research } from '@/lib/research';
// Notes are hidden for now. Uncomment these, `starredNotes`, and the Notes section below to bring them back.
// import { getNotes } from '@/lib/notes';
// import NotesTimeline from '@/components/NotesTimeline';

// What I'm working on right now. Change `updated` (YYYY-MM) whenever you edit the text.
const now = {
  updated: '2026-10',
  text: "I'm researching the safety of robot foundation models, looking at how their failure modes are similar to and different from those of LLMs. I'm also looking for funding and opportunities to continue this research at a larger scale. Alongside that, I'm making an interactive sculpture that visualizes residual stream activations!",
};

const nowUpdated = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${now.updated}-01T00:00:00Z`));

const inlineLink = 'underline underline-offset-4 decoration-[var(--foreground)]/25 hover:decoration-[#e33529] transition-colors';

export default function Home() {
  // const selected = research.filter(e => e.selected);
  // const starredNotes = getNotes().filter(note => note.starred);

  return (
    <div className="flex flex-col gap-14 pt-0 pb-8 md:pt-2 md:pb-12 animate-fade-in">
      {/* Intro */}
      <section className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="relative w-24 h-24 md:w-[170px] md:h-[170px] shrink-0">
          <Image src="/avatar.svg" alt="Faiaz Azmain Avatar" width={170} height={170} className="w-full h-full" priority />
          {/* Red marker loop scribbled around the head */}
          <svg viewBox="9 23 174 174" className="avatar-loop absolute inset-0 w-full h-full overflow-visible pointer-events-none" fill="none" stroke="#e33529" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path pathLength={1} d="M150 40 C 128 10, 52 12, 34 58 C 18 100, 40 150, 92 156 C 146 162, 176 120, 168 76 C 162 46, 140 30, 112 28" />
          </svg>
        </div>
        <div className="flex-1 flex flex-col">
          <p className="text-base md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            Hello, this is <Link href="/about" className={`font-medium ${inlineLink}`}>Faiaz</Link>.
          </p>
          <p className="text-base md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            I <Link href="/research" className={inlineLink}>research</Link> AI safety, <Link href="/projects" className={inlineLink}>build</Link> fun (and useful) things, and make interactive art.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 text-sm md:text-base font-medium text-[#e33529]">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=fazmain25@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#e33529]/40">Email</a>
            <a href="https://github.com/fazmain" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#e33529]/40">GitHub</a>
            <a href="https://x.com/faiazAz" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#e33529]/40">X (Twitter)</a>
            <a href="https://scholar.google.com/citations?user=tARzRWgAAAAJ" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#e33529]/40">Google Scholar</a>
          </div>
        </div>
      </section>

      {/* Now */}
      <section className="flex flex-col gap-3" aria-labelledby="now-heading">
        <h2 id="now-heading" className="text-xl md:text-2xl font-medium tracking-tight text-[#e33529]">Now</h2>
        <p className="text-base md:text-lg text-[var(--foreground)]/80 leading-relaxed">{now.text}</p>
        <p className="text-sm text-[var(--foreground)]/50">
          Updated <time dateTime={now.updated}>{nowUpdated}</time>
        </p>
      </section>

      {/* Selected research (hidden for now)
      <section className="flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[#e33529]">Selected research</h2>
        {selected.map(e => <ResearchCard key={e.slug} entry={e} />)}
        <Link href="/research" className="text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30 flex items-center gap-1 w-fit mt-1">
          All research <span className="opacity-70">→</span>
        </Link>
      </section>
      */}

      {/* Notes (hidden for now)
      <section className="flex flex-col gap-6" aria-labelledby="notes-heading">
        <h2 id="notes-heading" className="text-xl md:text-2xl font-medium tracking-tight text-[#e33529]">Notes</h2>
        {starredNotes.length > 0 && <NotesTimeline notes={starredNotes} />}
        <Link href="/notes" className="w-fit text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30">
          All notes <span aria-hidden="true">→</span>
        </Link>
      </section>
      */}
    </div>
  );
}
