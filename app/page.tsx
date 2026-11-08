import Link from 'next/link';
import Image from 'next/image';
import HoverCard from '@/components/HoverCard';
import DitherAvatar from '@/components/DitherAvatar';
import { papers } from '@/lib/research';
import { projects } from '@/lib/projects';
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

const inlineLink = 'underline underline-offset-4 decoration-[var(--foreground)]/25 hover:decoration-[#ac4c2e] transition-colors';
// Links that open a hover card: dotted underline that turns solid, so they read as "there's more here".
const previewLink = `${inlineLink} decoration-dotted hover:decoration-solid`;

const cardLabel = 'mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--foreground)]/45';
const cardMore = 'mt-3 block font-mono text-[10px] uppercase tracking-widest text-[#ac4c2e]';

function AboutCard() {
  return (
    <div className="flex w-64 items-center gap-3">
      <Image src="/avatar.svg" alt="" width={48} height={48} className="h-12 w-12 shrink-0" />
      <div>
        <p className="font-medium">Faiaz Azmain</p>
        <p className="text-[var(--foreground)]/65">AI safety researcher and creative technologist.</p>
      </div>
    </div>
  );
}

function ResearchPreview() {
  const recent = papers().slice(0, 3);
  return (
    <div className="w-72">
      <p className={cardLabel}>Recent research</p>
      <ul className="flex flex-col gap-2">
        {recent.map(p => (
          <li key={p.slug}>
            <p className="line-clamp-2">{p.title}</p>
            <p className="text-xs text-[var(--foreground)]/50">{p.venue ?? p.kind} · {p.year}</p>
          </li>
        ))}
      </ul>
      <Link href="/research" className={cardMore}>All research →</Link>
    </div>
  );
}

function ProjectsPreview() {
  return (
    <div className="w-64">
      <p className={cardLabel}>Things I&#39;ve built</p>
      <ul className="flex flex-col gap-1.5">
        {projects.map(p => (
          <li key={p.title} className="flex items-baseline justify-between gap-3">
            <a href={p.link} target="_blank" rel="noopener noreferrer" className="truncate hover:text-[#ac4c2e]">{p.title}</a>
            <span className="shrink-0 text-xs text-[var(--foreground)]/45">{p.tags[0]}</span>
          </li>
        ))}
      </ul>
      <Link href="/projects" className={cardMore}>All projects →</Link>
    </div>
  );
}

export default function Home() {
  // const selected = research.filter(e => e.selected);
  // const starredNotes = getNotes().filter(note => note.starred);

  return (
    <div className="flex flex-col gap-14 pt-0 pb-8 md:pt-2 md:pb-12 animate-fade-in">
      {/* Intro */}
      <section className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <DitherAvatar className="w-24 h-24 md:w-[168px] md:h-[168px]" />
        <div className="flex-1 flex flex-col">
          <p className="text-base md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            Hello, this is <HoverCard card={<AboutCard />}><Link href="/about" className={`font-medium ${previewLink}`}>Faiaz</Link></HoverCard>.
          </p>
          <p className="text-base md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            I <HoverCard card={<ResearchPreview />}><Link href="/research" className={previewLink}>research</Link></HoverCard> AI safety, <HoverCard card={<ProjectsPreview />}><Link href="/projects" className={previewLink}>build</Link></HoverCard> fun (and useful) things, and make interactive art.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 text-sm md:text-base font-medium text-[#ac4c2e]">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=fazmain25@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">Email</a>
            <a href="https://github.com/fazmain" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">GitHub</a>
            <a href="https://x.com/faiazAz" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">X (Twitter)</a>
            <a href="https://scholar.google.com/citations?user=tARzRWgAAAAJ" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">Google Scholar</a>
          </div>
        </div>
      </section>

      {/* Now */}
      <section className="flex flex-col gap-3" aria-labelledby="now-heading">
        <h2 id="now-heading" className="text-xl md:text-2xl font-medium tracking-tight text-[#ac4c2e]">Now</h2>
        <p className="text-base md:text-lg text-[var(--foreground)]/80 leading-relaxed">{now.text}</p>
        <p className="text-sm text-[var(--foreground)]/50">
          Updated <time dateTime={now.updated}>{nowUpdated}</time>
        </p>
      </section>

      {/* Selected research (hidden for now)
      <section className="flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[#ac4c2e]">Selected research</h2>
        {selected.map(e => <ResearchCard key={e.slug} entry={e} />)}
        <Link href="/research" className="text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30 flex items-center gap-1 w-fit mt-1">
          All research <span className="opacity-70">→</span>
        </Link>
      </section>
      */}

      {/* Notes (hidden for now)
      <section className="flex flex-col gap-6" aria-labelledby="notes-heading">
        <h2 id="notes-heading" className="text-xl md:text-2xl font-medium tracking-tight text-[#ac4c2e]">Notes</h2>
        {starredNotes.length > 0 && <NotesTimeline notes={starredNotes} />}
        <Link href="/notes" className="w-fit text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30">
          All notes <span aria-hidden="true">→</span>
        </Link>
      </section>
      */}
    </div>
  );
}
