/** A piece's text: paragraphs, with lines starting "## " as small headings. */
export default function ArtText({ text, className = '' }: { text: string[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-5 text-lg md:text-xl leading-relaxed text-[var(--foreground)]/85 ${className}`}>
      {text.map((p, i) =>
        p.startsWith('## ') ? (
          <h2 key={i} className="mt-6 font-mono text-sm uppercase tracking-[0.2em] text-[var(--foreground)]/55">
            {p.slice(3)}
          </h2>
        ) : (
          <p key={i}>{p}</p>
        ),
      )}
    </div>
  );
}
