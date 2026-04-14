import Link from 'next/link';

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
    <div className="flex flex-col gap-16 pt-0 pb-12 md:pt-4 md:pb-20 animate-fade-in max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--foreground)]/10 pb-8">
        <Link href="/" className="text-sm font-medium hover:underline underline-offset-4 decoration-[#ac4c2e]/40 flex items-center gap-1 w-fit mb-4 text-[#ac4c2e]">
          <span className="opacity-70">←</span> Back home
        </Link>
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight">Things I&#39;ve built</h1>
        <p className="text-lg text-[var(--foreground)]/70 max-w-2xl">
          A selection of projects ranging from web development to mechanistic interpretability research. 
        </p>
      </div>

      {/* Projects List */}
      <div className="flex flex-col gap-24">
        {projects.map((project, idx) => (
          <div key={idx} className={`group ${project.layout === 'two-column' ? 'grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start' : 'flex flex-col gap-6'}`}>
            
            {/* Media Block */}
            <div className="flex flex-col gap-4 w-full">
              {project.media.map((item, mIdx) => (
                <a key={mIdx} href={project.link} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <div className="w-full aspect-[16/9] bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 flex flex-col items-center justify-center rounded-lg transition-colors group-hover:bg-[#ac4c2e]/5 overflow-hidden relative">
                     {/* Placeholder info - swap for actual <img /> or <video /> when files exist */}
                     <span className="font-mono text-sm tracking-widest text-[var(--foreground)]/30 group-hover:text-[#ac4c2e]/50 text-center px-4">
                       [ {item.type.toUpperCase()}: {item.src.split('/').pop()} ]
                     </span>
                     <p className="text-xs text-[var(--foreground)]/30 mt-2 font-mono">(Missing asset)</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Description Block */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-2xl md:text-3xl font-medium tracking-tight hover:underline underline-offset-4 decoration-[#ac4c2e]/40 transition-colors w-fit group-hover:text-[#ac4c2e]">
                  {project.title} <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#ac4c2e]/70">↗</span>
                </a>
              </div>
              <p className="text-base md:text-lg text-[var(--foreground)]/70 leading-relaxed mt-2">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4">
                {project.tags.map((tag) => (
                   <span key={tag} className="text-sm italic text-[var(--foreground)]/50 font-serif lowercase px-2.5 py-1 bg-[var(--foreground)]/5 rounded-md">
                     #{tag}
                   </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
