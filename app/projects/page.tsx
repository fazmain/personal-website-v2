import { projects } from '@/lib/projects';

export const metadata = {
  title: "Projects",
  description: "Things I've built",
};

export default function ProjectsPage() {
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
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="w-fit text-base md:text-lg leading-snug text-accent hover:underline underline-offset-4 decoration-accent/40">
              {project.title}
            </a>
            <p className="text-sm md:text-base text-[var(--foreground)]/75 leading-relaxed">
              {project.description}
            </p>
            <p className="text-sm text-[var(--foreground)]/55">
              {project.tags.join(' · ')}
              <span className="mx-2 text-[var(--foreground)]/30">|</span>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline underline-offset-4">
                GitHub ↗
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
