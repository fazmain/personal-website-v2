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
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight">Research</h1>
        <p className="text-lg text-[var(--foreground)]/80">
          Papers, research sprints, and longer write-ups. For a full list of publications, see my{' '}
          <a href="https://scholar.google.com/citations?user=tARzRWgAAAAJ" target="_blank" rel="noopener noreferrer" className="text-[#ac4c2e] hover:underline underline-offset-4">Google Scholar</a>.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Papers</h2>
        {paperList.map(e => <ResearchCard key={e.slug} entry={e} />)}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Research blog posts</h2>
        {posts.length === 0 ? (
          <p className="text-[var(--foreground)]/60 italic">First write-ups coming soon.</p>
        ) : (
          posts.map(e => <ResearchCard key={e.slug} entry={e} />)
        )}
      </section>
    </div>
  );
}
