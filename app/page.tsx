import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData } from '@/lib/markdown';

// One line about what I'm up to right now. Update freely.
const currently = 'probing what chain-of-thought actually encodes, teaching, and sketching cities.';

const papers = [
  {
    title: 'AI Transparency Atlas: Framework, Scoring, and Real-Time Model Card Evaluation Pipeline',
    authors: 'Faiaz Azmain, Hanyu Wang, Akhmadillo Mamirov',
    venue: 'arXiv',
    year: '2025',
    href: 'https://arxiv.org/pdf/2512.12443',
  },
  {
    title: 'Sentiment Analysis in Software Engineering: Evaluating Generative Pre-trained Transformers',
    authors: 'Faiaz Azmain, KM Khalid Saifullah, Habiba Hye',
    venue: 'arXiv',
    year: '2025',
    href: 'https://arxiv.org/pdf/2505.14692',
  },
];

const inlineLink = 'underline underline-offset-4 decoration-[var(--foreground)]/25 hover:decoration-[#ac4c2e] transition-colors';

export default async function Home() {
  const essays = getSortedPostsData()
    .filter(post => post.showInHome !== false)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-14 pt-0 pb-8 md:pt-2 md:pb-12 animate-fade-in">
      {/* Intro */}
      <section className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <Image src="/avatar.svg" alt="Faiaz Azmain Avatar" width={170} height={170} className="w-24 h-24 md:w-[170px] md:h-[170px] shrink-0" priority />
        <div className="flex-1 flex flex-col">
          <p className="text-lg md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            Hello, this is <Link href="/about" className={`font-medium ${inlineLink}`}>Faiaz</Link>.
          </p>
          <p className="text-lg md:text-2xl text-[var(--foreground)]/80 leading-relaxed max-w-xl">
            I <a href="#research" className={inlineLink}>research AI Safety</a>, teach tech, <Link href="/projects" className={inlineLink}>build things</Link>, and make art with tech.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-6 text-md font-medium text-[#ac4c2e]">
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

      {/* Essays */}
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Essays</h2>
        <div className="flex flex-col gap-5">
          {essays.length === 0 ? (
            <p className="text-[var(--foreground)]/60 italic">No essays yet.</p>
          ) : (
            essays.map(({ slug, date, title, description }) => (
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
        <Link href="/blog" className="text-sm font-medium hover:underline underline-offset-4 decoration-[var(--foreground)]/30 flex items-center gap-1 w-fit mt-1">
          All essays <span className="opacity-70">→</span>
        </Link>
      </section>

      {/* Research */}
      <section id="research" className="flex flex-col gap-5 scroll-mt-12">
        <h2 className="text-2xl font-medium tracking-tight text-[#ac4c2e]">Research</h2>
        <ul className="flex flex-col gap-5">
          {papers.map(({ title, authors, venue, year, href }) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-1">
                <span className="text-lg font-medium leading-snug group-hover:underline underline-offset-4 decoration-[var(--foreground)]/30">
                  {title}
                </span>
                <span className="text-sm text-[var(--foreground)]/60">
                  {authors} · <span className="italic">{venue}</span>, {year}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
