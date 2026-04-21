import Link from 'next/link';
import Image from 'next/image';
import PhotoGrid, { Photo } from '@/components/PhotoGrid';
import fs from 'fs';
import path from 'path';

function getPhotos(): Photo[] {
  const photosDir = path.join(process.cwd(), 'public/photos');
  if (!fs.existsSync(photosDir)) {
    return [];
  }
  const files = fs.readdirSync(photosDir);
  return files
    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
    .map(file => {
      const name = path.parse(file).name;
      const caption = name.replace(/_/g, ' ');
      return {
        src: `/photos/${file}`,
        alt: caption,
        caption: caption
      };
    });
}

export default function About() {
  const photos = getPhotos();

  return (
    <div className="flex flex-col gap-12 py-12 md:py-20 animate-fade-in">
      <div className="flex flex-col gap-4">
        <Link href="/" className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-2 mb-4 w-fit">
          <span>←</span> Back to home
        </Link>
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight">About Me</h1>
      </div>

      <section className="prose prose-lg prose-neutral prose-headings:font-medium prose-headings:tracking-tight prose-a:text-[var(--foreground)] prose-a:decoration-[var(--foreground)]/30 prose-a:underline-offset-4 hover:prose-a:decoration-[var(--foreground)] prose-strong:text-[var(--foreground)] max-w-none prose-p:leading-relaxed">


        <p>
          I am a computer science student graduating May 2026. I am from Dhaka, Bangladesh and currently live in a small rural Ohio town. I am currently researching AI safety, particularly interpretability.
          Before getting into AI, I was interested in creating things people love and use. And I still am.
        </p>

        <p>
          In my free time, I like to play the guitar and sing. Occationally, I play badminton in my school.
        </p>


        <h4>Get in Touch</h4>
        <p>
          I'm always open to discussing research, collaboration opportunities, or just having a chat about the future of AI.
          Feel free to reach out via <a href="mailto:fazmain25@gmail.com">fazmain25@gmail.com</a> or connect with me on <a href="https://x.com/faiazAz" target="_blank" rel="noopener noreferrer">Twitter</a>.
        </p>

      </section>

      {/* Aesthetic Spacer */}
      <div className="w-8 border-b-[1px] border-[var(--foreground)]/20 mx-auto my-4"></div>

      {/* Snapshot / Vault section */}
      <section className="flex flex-col gap-6 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium tracking-tight text-[var(--foreground)]/80">Photos I love</h2>
        </div>
        <PhotoGrid photos={photos} />
      </section>

      <section className="flex flex-col gap-6 w-full mt-4">
        <h2 className="text-xl font-medium tracking-tight text-[var(--foreground)]/80">Collected Thoughts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full pt-2">

          <blockquote className="flex flex-col gap-3">
            <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
              "Just Keep Swimming"
            </p>
            <footer className="text-xs font-mono text-[var(--foreground)]/40 uppercase tracking-widest">
              — Dory
            </footer>
          </blockquote>

          <blockquote className="flex flex-col gap-3">
            <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
              The question of whether a computer can think is no more interesting than the question of whether a submarine can swim.
            </p>
            <footer className="text-xs font-mono text-[var(--foreground)]/40 uppercase tracking-widest">
              — Edsger Dijkstra
            </footer>
          </blockquote>

        </div>
      </section>

    </div>
  );
}
