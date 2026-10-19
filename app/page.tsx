import Link from 'next/link';
import Image from 'next/image';
import ResearchCard from '@/components/research/ResearchCard';
import { research } from '@/lib/research';
import { getNotes } from '@/lib/notes';
import NotesTimeline from '@/components/NotesTimeline';

// One line about what I'm up to right now. Update freely.
const currently = 'probing what chain-of-thought actually encodes, teaching, and sketching cities.';

const inlineLink = 'underline underline-offset-4 decoration-[var(--foreground)]/25 hover:decoration-[#ac4c2e] transition-colors';

export default function Home() {
  const selected = research.filter(e => e.selected);
  const starredNotes = getNotes().filter(note => note.starred);

  return (
    <div className="flex flex-col gap-14 pt-0 pb-8 md:pt-2 md:pb-12 animate-fade-in">
      {/* Intro */}
      <section className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <Image src="/avatar.svg" alt="Faiaz Azmain Avatar" width={170} height={170} className="w-24 h-24 md:w-[170px] md:h-[170px] shrink-0" priority />
        <div className="flex-1 flex flex-col">
          <p className="text-base md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            Hello, this is <Link href="/about" className={`font-medium ${inlineLink}`}>Faiaz</Link>.
          </p>
          <p className="text-base md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            I <Link href="/research" className={inlineLink}>research AI Safety</Link>, teach tech, <Link href="/projects" className={inlineLink}>build things</Link>, and make art with tech.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 text-sm md:text-base font-medium text-[#ac4c2e]">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=fazmain25@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">Email</a>
            <a href="https://github.com/fazmain" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">GitHub</a>
            <a href="https://x.com/faiazAz" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">X (Twitter)</a>
            <a href="https://scholar.google.com/citations?user=tARzRWgAAAAJ" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">Google Scholar</a>
          </div>
        </div>
      </section>

      {/* Currently */}
      <p className="text-base text-[var(--foreground)]/70 border-l-2 border-[#ac4c2e]/40 pl-4 -mt-4">
        <span className="italic text-[#ac4c2e]">Currently</span> — {currently}
      </p>

      {/* Selected research */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[#ac4c2e]">Selected research</h2>
        {selected.map(e => <ResearchCard key={e.slug} entry={e} />)}
        <Link href="/research" className="text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30 flex items-center gap-1 w-fit mt-1">
          All research <span className="opacity-70">→</span>
        </Link>
      </section>

      {/* Notes */}
      <section className="flex flex-col gap-6" aria-labelledby="notes-heading">
        <h2 id="notes-heading" className="text-xl md:text-2xl font-medium tracking-tight text-[#ac4c2e]">Notes</h2>
        {starredNotes.length > 0 && <NotesTimeline notes={starredNotes} />}
        <Link href="/notes" className="w-fit text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30">
          All notes <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
