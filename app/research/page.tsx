import ResearchCard from '@/components/research/ResearchCard';
import { papers, researchPosts } from '@/lib/research';

export const metadata = {
  title: 'Research',
  description: 'Papers and research write-ups on AI safety and interpretability.',
};

export default function ResearchPage() {
  const paperList = papers();
  const posts = researchPosts();

  return (
    <div className="flex flex-col gap-12 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col gap-4">
        <h1 className="text-[clamp(1.625rem,0.5rem+4vw,3rem)] font-medium tracking-tight">Research</h1>
        <p className="text-base md:text-lg text-[var(--foreground)]/80">
          Papers, research sprints, and longer write-ups. For a full list of publications, see my{' '}
          <a href="https://scholar.google.com/citations?user=tARzRWgAAAAJ" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline underline-offset-4">Google Scholar</a>.
        </p>
      </div>

      {/* Sections only appear once they have entries. */}
      {paperList.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[var(--accent)]">Papers</h2>
          {paperList.map(e => <ResearchCard key={e.slug} entry={e} />)}
        </section>
      )}

      {posts.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl md:text-2xl font-medium tracking-tight text-[var(--accent)]">Research blog posts</h2>
          {posts.map(e => <ResearchCard key={e.slug} entry={e} />)}
        </section>
      )}
    </div>
  );
}
