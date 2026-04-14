import Link from 'next/link';
import Image from 'next/image';

export default function About() {
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
    </div>
  );
}
