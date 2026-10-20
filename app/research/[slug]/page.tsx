// Research posts imported from research repos (content/posts/<slug>/, see POSTS.md).
// Hand-written entries with their own app/research/<slug>/ folder take precedence.

import 'katex/dist/katex.min.css';
import { notFound } from 'next/navigation';
import ResearchHeader from '@/components/research/ResearchHeader';
import Prose from '@/components/research/Prose';
import { FactsProvider } from '@/components/kit/facts';
import { postComponents } from '@/components/kit/mdx';
import { getFacts, getPost, getPosts } from '@/lib/posts';
import { postContent } from '@/lib/posts.generated';

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  return post ? { title: post.title, description: post.description } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const facts = getFacts(post);
  const load = postContent[slug];
  if (!load) notFound();
  const { default: Content } = await load();

  return (
    <article className="flex flex-col gap-8 py-8 md:py-12 animate-fade-in">
      <ResearchHeader slug={slug} />
      <FactsProvider facts={facts}>
        <Prose>
          <Content components={postComponents(slug, facts)} />
        </Prose>
      </FactsProvider>
    </article>
  );
}
