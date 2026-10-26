
export const metadata = {
  title: "Projects",
  description: "Things I've built",
};

export default function ProjectsPage() {
  const projects = [
    {
      title: "FeastFinder",
      description: "An intelligent platform that provides optimal food recommendations via natural language processing, matching user intent to culinary profiles.",
      link: "https://github.com/fazmain/FeastFinder",
      tags: ["LLMs", "React", "Node.js"],
      layout: "two-column",
      media: [
        { type: "image", src: "/images/projects/feastfinder_1.png" },
        // { type: "video", src: "/images/projects/feastfinder_demo.mp4" }
      ]
    },
    {
      title: "Quizzard",
      description: "A generative AI application designed to dynamically assemble structurally coherent academic quizzes to enhance student studying habits.",
      link: "https://github.com/fazmain/Quizzard-AI_quiz_app",
      tags: ["OpenAI", "Next.js", "GPT-4"],
      layout: "one-column",
      media: [
        { type: "image", src: "/images/projects/quizzard.png" }
      ]
    },
    {
      title: "ClassiBERT",
      description: "Deep learning research exploration focusing on BERT architectural efficiencies, classifying immense text layers efficiently.",
      link: "https://github.com/fazmain/ClassiBERT",
      tags: ["Python", "PyTorch", "NLP"],
      layout: "one-column",
      media: [
        { type: "image", src: "/images/projects/classibert.png" }
      ]
    },
    {
      title: "Attribution-Graph-Research",
      description: "Tools for Mechanistic Interpretability, creating interactive node connection mappings allowing researchers to peel back LLM neural circuitry.",
      link: "https://github.com/fazmain/Attribution-Graph-Research",
      tags: ["HTML", "Data Viz", "AI Safety"],
      layout: "two-column",
      media: [
        { type: "image", src: "/images/projects/attribution_1.png" },
        { type: "image", src: "/images/projects/attribution_2.png" }
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-12 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col gap-4">
        <h1 className="text-[clamp(1.625rem,0.5rem+4vw,3rem)] font-medium tracking-tight">Things I&#39;ve built</h1>
        <p className="text-base md:text-lg text-[var(--foreground)]/80">
          A selection of projects ranging from web development to mechanistic interpretability research.
        </p>
      </div>

      {/* Plain list for now. Each project's `media` and `layout` are kept for when screenshots are added. */}
      <ul className="flex flex-col gap-8">
        {projects.map((project) => (
          <li key={project.title} className="flex flex-col gap-1.5">
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="w-fit text-base md:text-lg leading-snug text-[var(--accent)] hover:underline underline-offset-4 decoration-[var(--accent)]/40">
              {project.title}
            </a>
            <p className="text-sm md:text-base text-[var(--foreground)]/75 leading-relaxed">
              {project.description}
            </p>
            <p className="text-sm text-[var(--foreground)]/55">
              {project.tags.join(' · ')}
              <span className="mx-2 text-[var(--foreground)]/30">|</span>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] hover:underline underline-offset-4">
                GitHub ↗
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
