import Link from 'next/link';
import { getSortedPostsData } from '@/lib/markdown';

export default async function BlogIndex() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="flex flex-col gap-8 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col gap-4">
        <Link href="/" className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-2 mb-4 w-fit">
          <span>←</span> Back to home
        </Link>
        <h1 className="text-[clamp(1.625rem,0.5rem+4vw,3rem)] font-medium tracking-tight">All Posts</h1>
        <p className="text-base md:text-lg text-[var(--foreground)]/80">
          My thoughts, research notes, and reflections.
        </p>
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          {allPostsData.length === 0 ? (
            <p className="text-[var(--foreground)]/60 italic">No posts found.</p>
          ) : (
            allPostsData.map(({ slug, date, title, description }) => (
              <div key={slug} className="flex flex-col gap-1 w-full group">
                <Link href={`/blog/${slug}`} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2 w-full">
                  <span className="text-base md:text-lg font-medium group-hover:underline underline-offset-4 decoration-[var(--foreground)]/30 transition-all">
                    {title}
                  </span>
                  <div className="hidden sm:block flex-1 border-b-[2px] border-dotted border-[var(--foreground)]/20 mx-2 relative top-[-6px] min-w-[20px]"></div>
                  <time dateTime={date} className="text-[var(--foreground)]/70 shrink-0 text-sm md:text-base">
                    {new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </Link>
                {description && (
                  <p className="text-sm text-[var(--foreground)]/70 leading-relaxed mt-1">
                    {description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
