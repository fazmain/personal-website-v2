import ResearchCard from '@/components/research/ResearchCard';
import { papers } from '@/lib/research';

export const metadata = {
  title: 'Publications',
  description: 'Published papers and preprints.',
};

export default function PublicationsPage() {
  const all = papers();
  const groups = [
    { heading: 'Conference & workshop papers', entries: all.filter(e => e.kind === 'conference') },
    { heading: 'Preprints', entries: all.filter(e => e.kind === 'preprint') },
  ].filter(g => g.entries.length > 0);

  return (
    <div className="flex flex-col gap-12 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col gap-4">
        <h1 className="text-[clamp(1.625rem,0.5rem+4vw,3rem)] font-medium tracking-tight">Publications</h1>
        <p className="text-base md:text-lg text-[var(--foreground)]/80">
          Also on{' '}
          <a href="https://scholar.google.com/citations?user=tARzRWgAAAAJ" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline underline-offset-4">Google Scholar</a>.
        </p>
      </div>

      {groups.map(({ heading, entries }) => (
        <section key={heading} className="flex flex-col gap-4">
          <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[var(--accent)]">{heading}</h2>
          {entries.map(e => <ResearchCard key={e.slug} entry={e} />)}
        </section>
      ))}
    </div>
  );
}
