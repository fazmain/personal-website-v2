import type { MDXComponents } from 'mdx/types';
import type { Facts } from '@/lib/posts';
import Interactive from './Interactive';

// Components available in every research post's site/index.mdx without importing.
// Bundle-relative paths (figures/x.png, media/x.mp4) resolve to /posts/<slug>/...,
// where scripts/posts.mjs copies them.

const frame = 'rounded-md border border-[var(--foreground)]/10 bg-[var(--foreground)]/[0.025]';

function Caption({ children }: { children?: React.ReactNode }) {
  return children ? <figcaption className="text-sm text-[var(--foreground)]/60 leading-relaxed">{children}</figcaption> : null;
}

function wideClass(wide?: boolean) {
  return wide ? 'post-wide' : '';
}

export function postComponents(slug: string, facts: Facts): MDXComponents {
  const asset = (src: string) => (/^(https?:)?\/\//.test(src) || src.startsWith('/') ? src : `/posts/${slug}/${src.replace(/^\.\//, '')}`);

  return {
    img: ({ src, alt, ...rest }: React.ComponentProps<'img'>) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={typeof src === 'string' ? asset(src) : undefined} alt={alt ?? ''} {...rest} />
    ),

    Fact: ({ id }: { id: string }) => {
      const fact = facts[id];
      if (!fact) throw new Error(`Post "${slug}": <Fact id="${id}"> is not in facts.json`);
      return <span className="tabular-nums" title={fact.what}>{fact.display}</span>;
    },

    Figure: ({ src, alt, caption, wide }: { src: string; alt: string; caption?: React.ReactNode; wide?: boolean }) => (
      <figure className={`not-prose my-10 flex flex-col gap-3 ${wideClass(wide)}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(src)} alt={alt} className={`w-full h-auto ${frame}`} loading="lazy" />
        <Caption>{caption}</Caption>
      </figure>
    ),

    Video: ({ src, poster, caption, loop }: { src: string; poster: string; caption?: React.ReactNode; loop?: boolean }) => (
      <figure className="not-prose my-10 flex flex-col gap-3">
        <video src={asset(src)} poster={asset(poster)} controls muted playsInline loop={loop} preload="none" className={`w-full h-auto ${frame}`} />
        <Caption>{caption}</Caption>
      </figure>
    ),

    Interactive: ({ fallback, alt, caption, height, wide, children }: {
      fallback: string; alt: string; caption?: React.ReactNode; height?: number; wide?: boolean; children: React.ReactNode;
    }) => (
      <figure className={`not-prose my-10 flex flex-col gap-3 ${wideClass(wide)}`}>
        <div className={`${frame} p-5`}>
          <Interactive fallback={asset(fallback)} alt={alt} height={height}>{children}</Interactive>
        </div>
        <Caption>{caption}</Caption>
      </figure>
    ),

    Callout: ({ kind = 'note', children }: { kind?: 'note' | 'result' | 'caveat'; children: React.ReactNode }) => {
      const tone = {
        note: 'border-[var(--foreground)]/25',
        result: 'border-[var(--accent)]',
        caveat: 'border-[#c79a2e]',
      }[kind];
      const label = { note: 'Note', result: 'Result', caveat: 'Caveat' }[kind];
      return (
        <aside className={`not-prose my-8 border-l-2 ${tone} pl-4 text-base leading-relaxed text-[var(--foreground)]/85`}>
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--foreground)]/55">{label}</span>
          {children}
        </aside>
      );
    },

    Wide: ({ children }: { children: React.ReactNode }) => <div className="post-wide">{children}</div>,
  };
}
