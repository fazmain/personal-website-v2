import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData } from '@/lib/markdown';

export default async function Home() {
  const allPostsData = getSortedPostsData();
  const homePosts = allPostsData.filter(post => post.showInHome !== false);
  const essayPosts = homePosts.filter(post => post.category?.toLowerCase() === "thoughts" || post.category?.toLowerCase() === "opinion").slice(0, 3);
  const technicalPosts = homePosts.filter(post => post.category?.toLowerCase() === "research").slice(0, 3);

  return (
    <div className="flex flex-col gap-12 pt-0 pb-8 md:pt-2 md:pb-12 animate-fade-in">
      {/* Header Section */}
      <section className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <Image src="/avatar.svg" alt="Faiaz Azmain Avatar" width={200} height={200} className="w-24 h-24 md:w-[200px] md:h-[200px] shrink-0" priority />
        <div className="flex-1 flex flex-col">

          <p className="text-lg md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            Hello, I am <Link href="/about" className="font-medium underline underline-offset-4 decoration-[var(--foreground)]/30 hover:decoration-[var(--foreground)] transition-colors">Faiaz</Link>.
          </p>
          <p className="text-lg md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            I research AI interpretability and alignment.
          </p>

          <p className="text-lg md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            {/* I also love to build <Link href="/projects" className="underline underline-offset-4 decoration-[#ac4c2e]/40 hover:decoration-[#ac4c2e] transition-colors">things</Link>. */}
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
      <section className="flex flex-col gap-6 md:gap-8">

        {/* Technical Posts */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Research &amp; Technical Notes</h2>
          </div>
          <div className="flex flex-col gap-5">
            {technicalPosts.length === 0 ? (
              <p className="text-[var(--foreground)]/60 italic">No technical posts found.</p>
            ) : (
              technicalPosts.map(({ slug, date, title, description }) => (
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
                  {description && (
                    <p className="text-sm text-[var(--foreground)]/70 leading-relaxed mt-1">
                      {description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Essay Posts */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Essays &amp; Thoughts</h2>
          </div>
          <div className="flex flex-col gap-6">
            {essayPosts.length === 0 ? (
              <p className="text-[var(--foreground)]/60 italic">No essays found.</p>
            ) : (
              essayPosts.map(({ slug, date, title, description }) => (
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
                  {description && (
                    <p className="text-sm text-[var(--foreground)]/70 leading-relaxed mt-1">
                      {description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <Link href="/blog" className="text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30 flex items-center gap-1 w-fit mt-2">
            View all posts <span className="opacity-70">→</span>
          </Link>
        </div>
      </section>

      {/* Research Section */}
      <section className="flex flex-col gap-6 md:gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Research</h2>
        </div>
        <div className="flex flex-col gap-5">
          <a href="https://arxiv.org/pdf/2512.12443" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-3 group border border-[var(--foreground)]/10 rounded-xl p-5 hover:bg-[var(--foreground)]/[0.02] transition-colors">
            <h3 className="text-lg font-medium group-hover:underline underline-offset-4 decoration-[#ac4c2e]/40 transition-colors">
              AI Transparency Atlas: Framework, Scoring, and Real-Time Model Card Evaluation Pipeline <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ac4c2e]/70">↗</span>
            </h3>
            <p className="text-[var(--foreground)]/70 text-base leading-relaxed">
              A comprehensive framework and scoring mechanism designed to dynamically evaluate and validate the reliability of AI Model Cards in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center mt-1 text-sm text-[var(--foreground)]/50">
              <span>Faiaz Azmain, Hanyu Wang, Akhmadillo Mamirov</span>
              <span className="hidden sm:inline border-l border-[var(--foreground)]/20 h-3"></span>
              <span className="hover:text-[var(--foreground)] transition-colors">View Article</span>
            </div>
          </a>

          <a href="https://arxiv.org/pdf/2505.14692" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-3 group border border-[var(--foreground)]/10 rounded-xl p-5 hover:bg-[var(--foreground)]/[0.02] transition-colors">
            <h3 className="text-lg font-medium group-hover:underline underline-offset-4 decoration-[#ac4c2e]/40 transition-colors">
              Sentiment Analysis in Software Engineering: Evaluating Generative Pre-trained Transformers <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ac4c2e]/70">↗</span>
            </h3>
            <p className="text-[var(--foreground)]/70 text-base leading-relaxed">
              An evaluation of modern large language models, specifically GPT architectures, on their ability to accurately analyze and extract sentiment from complex software engineering text corpuses.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center mt-1 text-sm text-[var(--foreground)]/50">
              <span>Faiaz Azmain, KM Khalid Saifullah, Habiba Hye</span>
              <span className="hidden sm:inline border-l border-[var(--foreground)]/20 h-3"></span>
              <span className="hover:text-[var(--foreground)] transition-colors">ArXiv Link</span>
            </div>
          </a>
        </div>
      </section>

      {/* Experience Section */}
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Work</h2>
        <div className="flex flex-col gap-6 text-base md:text-lg">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-6 items-start">
            <span className="w-30 shrink-0 text-[var(--foreground)]/60 mt-0.5">Summer 2025</span>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-x-2 gap-y-1 sm:gap-4 items-center">
                <span className="text-[var(--foreground)] font-medium">Wayne County Visitors Bureau</span>
                <span className="hidden sm:inline text-[var(--foreground)]/40">—</span>
                <span className="text-[var(--foreground)]/60">Software Engineer Intern</span>
              </div>
              <p className="text-sm text-[var(--foreground)]/70 leading-relaxed max-w-xl">
                Built an offline-first map for tourist engagement and itinerary planning.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-1 sm:gap-6 items-start">
            <span className="w-30 shrink-0 text-[var(--foreground)]/60 mt-0.5">Summer 2024</span>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-x-2 gap-y-1 sm:gap-4 items-center">
                <span className="text-[var(--foreground)] font-medium">Shiree Private Limited</span>
                <span className="hidden sm:inline text-[var(--foreground)]/40">—</span>
                <span className="text-[var(--foreground)]/60">Software Engineer Intern</span>
              </div>
              <p className="text-sm text-[var(--foreground)]/70 leading-relaxed max-w-xl">
                Implemented scalable service-worker architectures to ensure seamless offline capabilities in low-bandwidth regions.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-1 sm:gap-6 items-start">
            <span className="w-30 shrink-0 text-[var(--foreground)]/60 mt-0.5">Summer 2023</span>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-x-2 gap-y-1 sm:gap-4 items-center">
                <span className="text-[var(--foreground)] font-medium">Shiree Private Limited</span>
                <span className="hidden sm:inline text-[var(--foreground)]/40">—</span>
                <span className="text-[var(--foreground)]/60">Product Manager Intern</span>
              </div>
              <p className="text-sm text-[var(--foreground)]/70 leading-relaxed max-w-xl">
                Collaborated with cross-functional teams to develop user dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
