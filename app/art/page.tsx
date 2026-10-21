export const metadata = {
  title: 'Art — Faiaz Azmain',
  description: 'Interactive art and experiments in code, light, and machines.',
};

export default function ArtPage() {
  return (
    <div className="flex flex-col gap-6 py-8 md:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#78e4ff]/70">the other side</p>
      <h1 className="text-[clamp(2.25rem,1rem+5vw,4rem)] font-medium tracking-tight leading-none">Art</h1>
      <p className="text-base md:text-lg text-[var(--foreground)]/70 max-w-xl leading-relaxed">
        Experiments in code, light, and interaction. Most of them run live, right here in your browser.
      </p>
      <p className="font-mono text-sm text-[var(--foreground)]/40">
        pieces arriving soon<span className="art-cursor">_</span>
      </p>
    </div>
  );
}
