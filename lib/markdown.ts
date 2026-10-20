import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/blogs');

export interface BlogPostData {
  slug: string;
  title: string;
  date: string;
  category?: string;
  showInHome?: boolean;
  /** Hidden posts are left out of lists but still reachable by direct link. */
  hidden?: boolean;
  contentHtml?: string;
  description?: string;
}

export function getSortedPostsData({ includeHidden = false } = {}): BlogPostData[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.filter(fileName => fileName.endsWith('.md')).map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);

    return {
      slug,
      ...(matterResult.data as { date: string; title: string; category?: string; showInHome?: boolean; hidden?: boolean; description?: string }),
    };
  });

  // Dates aren't zero-padded ("2023-5-11"), so compare as dates rather than strings.
  return allPostsData
    .filter(post => includeHidden || !post.hidden)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostData(slug: string): Promise<BlogPostData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    ...(matterResult.data as { date: string; title: string; category?: string; showInHome?: boolean; hidden?: boolean; description?: string }),
  };
}
