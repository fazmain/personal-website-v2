import Link from 'next/link';
import { getPostData, getSortedPostsData } from '@/lib/markdown';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  let postData;
  try {
    postData = await getPostData(params.slug);
  } catch (e) {
    notFound();
  }

  return (
    <article className="flex flex-col gap-8 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col gap-3">
        <Link href="/" className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-2 mb-4 w-fit">
          <span>←</span> Back to home
        </Link>
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight leading-tight">{postData.title}</h1>
        <div className="flex items-center gap-3 text-sm text-[var(--foreground)]/60">
          <time dateTime={postData.date}>
            {new Date(postData.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {postData.tags && postData.tags.length > 0 && (
            <div className="flex gap-2">
              <span className="opacity-50">•</span>
              {postData.tags.map(tag => (
                <span key={tag} className="lowercase">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr className="border-[var(--foreground)]/10" />

      <div 
        className="prose prose-lg prose-neutral prose-headings:font-medium prose-headings:tracking-tight prose-a:text-[var(--foreground)] prose-a:decoration-[var(--foreground)]/30 prose-a:underline-offset-4 hover:prose-a:decoration-[var(--foreground)] prose-strong:text-[var(--foreground)] max-w-none prose-p:leading-relaxed prose-pre:bg-[#1a1f2c] prose-pre:text-[#e2e8f0] prose-pre:border prose-pre:border-[var(--foreground)]/10"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }} 
      />
    </article>
  );
}
