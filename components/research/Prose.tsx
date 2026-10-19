/** Typography for research write-ups. Matches the essay pages. */
export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-base md:prose-lg prose-neutral prose-headings:font-medium prose-headings:tracking-tight prose-a:text-[var(--foreground)] prose-a:decoration-[var(--foreground)]/30 prose-a:underline-offset-4 hover:prose-a:decoration-[var(--foreground)] prose-strong:text-[var(--foreground)] max-w-none prose-p:leading-relaxed prose-pre:bg-[#1a1f2c] prose-pre:text-[#e2e8f0] prose-code:before:content-none prose-code:after:content-none">
      {children}
    </div>
  );
}

/** A captioned box for figures and interactive demos. Escapes prose styling. */
export function Figure({ caption, children }: { caption?: React.ReactNode; children: React.ReactNode }) {
  return (
    <figure className="not-prose my-10 flex flex-col gap-3">
      <div className="rounded-md border border-[var(--foreground)]/10 bg-[var(--foreground)]/[0.025] p-5">{children}</div>
      {caption && <figcaption className="text-sm text-[var(--foreground)]/60 leading-relaxed">{caption}</figcaption>}
    </figure>
  );
}
