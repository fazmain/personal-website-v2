import fs from 'fs';
import path from 'path';
import type { ResearchEntry, ResearchKind } from '@/lib/research';

// Research posts imported from research repos as bundles (see POSTS.md).
// Each lives in content/posts/<slug>/ with post.json, facts.json and site/index.mdx.
// In `next dev`, bundles synced to content/posts/_preview/<slug>/ are shown too.

const POSTS_DIR = path.join(process.cwd(), 'content/posts');
const PREVIEW = '_preview';
const KINDS: ResearchKind[] = ['preprint', 'conference', 'sprint', 'extended'];

export interface Fact {
  value: number | string;
  display: string;
  what: string;
}
export type Facts = Record<string, Fact>;

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  kind: ResearchKind;
  venue?: string;
  authors: string[];
  selected?: boolean;
  embargo_until?: string | null;
  links?: ResearchEntry['links'];
  /** Folder under content/posts/, e.g. "my-post" or "_preview/my-post". */
  dir: string;
}

const isDev = process.env.NODE_ENV === 'development';

function readPost(dir: string): PostMeta | null {
  const file = path.join(POSTS_DIR, dir, 'post.json');
  if (!fs.existsSync(file)) return null;
  const post = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!KINDS.includes(post.kind)) {
    throw new Error(`content/posts/${dir}/post.json: kind must be one of ${KINDS.join(', ')}`);
  }
  return { ...post, dir };
}

function listDirs(base: string): string[] {
  const full = path.join(POSTS_DIR, base);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map(d => path.posix.join(base, d.name));
}

let cache: PostMeta[] | null = null;

export function getPosts(): PostMeta[] {
  if (cache && !isDev) return cache;
  const bySlug = new Map<string, PostMeta>();
  const today = new Date().toISOString().slice(0, 10);
  // Previews come second so they override an imported post with the same slug.
  for (const dir of [...listDirs(''), ...(isDev ? listDirs(PREVIEW) : [])]) {
    const post = readPost(dir);
    if (!post) continue;
    if (!isDev && post.embargo_until && post.embargo_until > today) continue;
    bySlug.set(post.slug, post);
  }
  cache = [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

export function getPost(slug: string): PostMeta | undefined {
  return getPosts().find(p => p.slug === slug);
}

export function getFacts(post: PostMeta): Facts {
  return JSON.parse(fs.readFileSync(path.join(POSTS_DIR, post.dir, 'facts.json'), 'utf8'));
}

export function toResearchEntry(post: PostMeta): ResearchEntry {
  return {
    slug: post.slug,
    title: post.title,
    authors: post.authors,
    kind: post.kind,
    venue: post.venue,
    year: Number(post.date.slice(0, 4)),
    summary: post.description,
    selected: post.selected,
    hasPage: true,
    links: post.links,
  };
}
