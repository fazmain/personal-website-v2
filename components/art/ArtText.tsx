/** A piece's text: paragraphs, with lines starting "## " as small headings. */
export default function ArtText({ text, className = '' }: { text: string[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-5 text-base md:text-[1.075rem] leading-relaxed text-[var(--foreground)]/80 ${className}`}>
      {text.map((p, i) =>
        p.startsWith('## ') ? (
          <h2 key={i} className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--foreground)]/45">
            {p.slice(3)}
          </h2>
        ) : (
          <p key={i}>{p}</p>
        ),
      )}
    </div>
  );
}
