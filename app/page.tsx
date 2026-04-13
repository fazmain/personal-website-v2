import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData } from '@/lib/markdown';

export default async function Home() {
  const allPostsData = getSortedPostsData().slice(0, 5); // Limit to top 5 for home

  return (
    <div className="flex flex-col gap-16 pt-0 pb-12 md:pt-2 md:pb-20 animate-fade-in">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
        <Image src="/avatar.svg" alt="Faiaz Azmain Avatar" width={200} height={200} className="w-24 h-24 md:w-[200px] md:h-[200px] shrink-0" priority />
        <div className="flex-1 flex flex-col">

          <p className="text-lg md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            Hello, I am <Link href="/about" className="font-medium underline underline-offset-4 decoration-[var(--foreground)]/30 hover:decoration-[var(--foreground)] transition-colors">Faiaz</Link>.
          </p>
          <p className="text-lg md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            I research AI interpretability and alignment.
          </p>

          <p className="text-lg md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            I also love to build things.
          </p>
          <div className="flex gap-4 mt-6 text-sm font-medium text-[#ac4c2e]">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=fazmain25@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">Email</a>
            <a href="https://github.com/fazmain" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">GitHub</a>
            <a href="https://x.com/faiazAz" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">X (Twitter)</a>
            <a href="https://scholar.google.com/citations?user=tARzRWgAAAAJ" target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-[#ac4c2e]/40">Google Scholar</a>

          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section className="flex flex-col gap-8 md:gap-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Posts</h2>
        </div>
        <div className="flex flex-col gap-6">
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
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {tags.map((tag) => (
                      <span key={tag} className="text-sm italic text-[var(--foreground)]/50 font-serif lowercase">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div>
          <Link href="/blog" className="text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30 flex items-center gap-1 w-fit">
            View all posts <span className="opacity-70">→</span>
          </Link>
        </div>
      </section>

      {/* Experience Section */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Work</h2>
        <div className="flex flex-col gap-4 text-base md:text-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
            <span className="w-30 shrink-0 text-[var(--foreground)]/60">Summer 2025</span>
            <div className="flex flex-wrap gap-x-2 gap-y-1 sm:gap-4">
              <span className="text-[var(--foreground)]">Wayne Country Visitors Bureau</span>
              <span className="hidden sm:inline text-[var(--foreground)]/40">—</span>
              <span className="text-[var(--foreground)]/60">Software Engineer Intern</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
            <span className="w-30 shrink-0 text-[var(--foreground)]/60">Summer 2024</span>
            <div className="flex flex-wrap gap-x-2 gap-y-1 sm:gap-4">
              <span className="text-[var(--foreground)]">Shiree Private Limited</span>
              <span className="hidden sm:inline text-[var(--foreground)]/40">—</span>
              <span className="text-[var(--foreground)]/60">Software Engineer Intern</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
            <span className="w-30 shrink-0 text-[var(--foreground)]/60">Summer 2023</span>
            <div className="flex flex-wrap gap-x-2 gap-y-1 sm:gap-4">
              <span className="text-[var(--foreground)]">Shiree Private Limited</span>
              <span className="hidden sm:inline text-[var(--foreground)]/40">—</span>
              <span className="text-[var(--foreground)]/60">Product Manager Intern</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
