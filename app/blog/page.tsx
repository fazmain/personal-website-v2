import Link from 'next/link';
import { getSortedPostsData } from '@/lib/markdown';

export default async function BlogIndex() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="flex flex-col gap-12 py-12 md:py-20 animate-fade-in">
      <div className="flex flex-col gap-4">
        <Link href="/" className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-2 mb-4 w-fit">
          <span>←</span> Back to home
        </Link>
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight">All Posts</h1>
        <p className="text-lg text-[var(--foreground)]/80">
          My thoughts, research notes, and reflections.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          {allPostsData.length === 0 ? (
            <p className="text-[var(--foreground)]/60 italic">No posts found.</p>
          ) : (
            allPostsData.map(({ slug, date, title, tags }) => (
              <div key={slug} className="flex flex-col gap-1 w-full group">
                <Link href={`/blog/${slug}`} className="flex items-baseline gap-2 w-full">
                  <span className="text-lg font-medium group-hover:underline underline-offset-4 decoration-[var(--foreground)]/30 transition-all">
                    {title}
                  </span>
                  <div className="flex-1 border-b-[2px] border-dotted border-[var(--foreground)]/20 mx-2 relative top-[-6px] min-w-[20px]"></div>
                  <time dateTime={date} className="text-[var(--foreground)]/70 shrink-0 text-md">
                    {new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </Link>
                {tags && tags.length > 0 && (
                   <span className="text-sm italic text-[var(--foreground)]/50 font-serif lowercase">
                     #{tags[0]}
                   </span>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
