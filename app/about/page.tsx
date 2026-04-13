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

      <section className="flex flex-col prose prose-lg prose-neutral prose-headings:font-medium prose-headings:tracking-tight prose-a:text-[var(--foreground)] prose-a:decoration-[var(--foreground)]/30 prose-a:underline-offset-4 hover:prose-a:decoration-[var(--foreground)] prose-strong:text-[var(--foreground)] max-w-none prose-p:leading-relaxed">


        <p>
          I am a software engineer and researcher with a deep focus on Mechanistic Interpretability.
          My goal is to reverse-engineer Large Language Models to understand the learned circuits and features that drive their immense capabilities.
          Through this work, I aim to address the pressing challenges of AI safety, alignment, and reliability.
        </p>

        <h2>Professional Journey</h2>
        <p>
          Recently, I have been working as a Software Engineer Intern at Shiree Private Limited, where I focus on full-stack development.
          My work involves building scalable and resilient applications, such as integrating React Service Workers for offline capabilities in low-bandwidth regions.
        </p>
        <p>
          Prior to that, at Wayne Country Visitors Bureau, I built an offline-first map as a progressive web app, aimed at enhancing tourist experiences.
          I also developed AI-powered itinerary generation tailored to the specific needs of users, giving me practical insight into deploying ML models to consumer-facing applications.
        </p>

        <h2>Philosophy</h2>
        <p>
          I believe that technology reaches its full potential when it's built transparently and thoughtfully.
          Whether I'm writing a technical deep dive or shipping production code, I prioritize simplicity, robustness, and interpretability in both code and artificial neural networks.
        </p>

        <h2>Get in Touch</h2>
        <p>
          I'm always open to discussing research, collaboration opportunities, or just having a chat about the future of AI.
          Feel free to reach out via <a href="mailto:contact@fazmain.com">email</a> or connect with me on <a href="https://x.com" target="_blank" rel="noopener noreferrer">Twitter</a>.
        </p>
      </section>
    </div>
  );
}
