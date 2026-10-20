#!/usr/bin/env node
// Checks imported research posts, copies their figures/media to public/posts/<slug>/,
// and writes lib/posts.generated.ts (one static import per post, for Turbopack).
// Runs before `next dev` (with --dev, includes content/posts/_preview/) and `next build`.
// Any problem fails the build. Full checks live in the publish-post skill (postctl check).

import fs from 'node:fs';
import path from 'node:path';

const dev = process.argv.includes('--dev');
const root = process.cwd();
const postsDir = path.join(root, 'content/posts');
const publicDir = path.join(root, 'public/posts');
const registryFile = path.join(root, 'lib/posts.generated.ts');
const KINDS = ['preprint', 'conference', 'sprint', 'extended'];
const ASSET_DIRS = ['figures', 'media'];
const today = new Date().toISOString().slice(0, 10);

const errors = [];
const fail = (dir, msg) => errors.push(`content/posts/${dir}: ${msg}`);

function listDirs(base) {
  const full = path.join(postsDir, base);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map(d => path.posix.join(base, d.name));
}

function readJson(dir, file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(postsDir, dir, file), 'utf8'));
  } catch (e) {
    fail(dir, `${file}: ${e.code === 'ENOENT' ? 'missing' : e.message}`);
    return null;
  }
}

const inside = (base, target) => {
  const rel = path.relative(base, target);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
};

function checkComponents(dir) {
  const base = path.join(postsDir, dir);
  const compDir = path.join(base, 'site/components');
  if (!fs.existsSync(compDir)) return;
  for (const file of fs.readdirSync(compDir, { recursive: true })) {
    const full = path.join(compDir, file);
    if (!/\.(tsx|ts|jsx)$/.test(full) || !fs.statSync(full).isFile()) continue;
    const code = fs.readFileSync(full, 'utf8');
    const imports = [...code.matchAll(/(?:^|\n)\s*import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]|\brequire\(\s*['"]([^'"]+)['"]/g)]
      .map(m => m[1] ?? m[2] ?? m[3]);
    for (const src of imports) {
      if (src === 'react' || src === '@/components/kit') continue;
      if (src.startsWith('.') && inside(base, path.resolve(path.dirname(full), src))) continue;
      fail(dir, `site/components/${file}: import '${src}' not allowed (react, @/components/kit, files in the bundle)`);
    }
    if (/\bfetch\s*\(|XMLHttpRequest|WebSocket|\beval\s*\(|dangerouslySetInnerHTML/.test(code)) {
      fail(dir, `site/components/${file}: network calls, eval and dangerouslySetInnerHTML are not allowed`);
    }
  }
}

function checkPost(dir) {
  const post = readJson(dir, 'post.json');
  const facts = readJson(dir, 'facts.json');
  if (!post || !facts) return null;
  const slug = path.posix.basename(dir);
  if (post.slug !== slug) fail(dir, `post.json slug "${post.slug}" must match folder name`);
  for (const key of ['title', 'description', 'date', 'kind']) if (!post[key]) fail(dir, `post.json: ${key} missing`);
  if (!Array.isArray(post.authors) || post.authors.length === 0) fail(dir, 'post.json: authors missing');
  if (post.kind && !KINDS.includes(post.kind)) fail(dir, `post.json: kind must be one of ${KINDS.join(', ')}`);
  if (!dev && post.embargo_until && post.embargo_until > today) {
    console.log(`posts: ${slug} embargoed until ${post.embargo_until}, skipped`);
    return null;
  }
  const mdxPath = path.join(postsDir, dir, 'site/index.mdx');
  if (!fs.existsSync(mdxPath)) {
    fail(dir, 'site/index.mdx missing');
    return null;
  }
  const mdx = fs.readFileSync(mdxPath, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const m of mdx.matchAll(/^import\s+.+?\s+from\s+['"]([^'"]+)['"]/gm)) {
    if (!m[1].startsWith('./components/')) fail(dir, `site/index.mdx: import '${m[1]}' not allowed (kit components are global)`);
  }
  for (const m of mdx.matchAll(/<Fact\b[^>]*\bid\s*=\s*["']([^"']+)["']/g)) {
    if (!facts[m[1]]) fail(dir, `site/index.mdx: <Fact id="${m[1]}"> not in facts.json`);
  }
  const refs = [
    ...[...mdx.matchAll(/\b(?:src|fallback|poster)\s*=\s*["']([^"']+)["']/g)].map(m => m[1]),
    ...[...mdx.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map(m => m[1]),
  ].filter(r => !/^(https?:)?\/\//.test(r) && !r.startsWith('/'));
  for (const ref of refs) {
    const target = path.resolve(postsDir, dir, ref);
    if (!ASSET_DIRS.some(d => inside(path.join(postsDir, dir, d), target))) fail(dir, `${ref}: files must live in figures/ or media/`);
    else if (!fs.existsSync(target)) fail(dir, `${ref} does not exist`);
  }
  checkComponents(dir);
  return { slug, dir };
}

const posts = new Map();
for (const dir of [...listDirs(''), ...(dev ? listDirs('_preview') : [])]) {
  const post = checkPost(dir);
  if (post) posts.set(post.slug, post); // previews override same-slug imports
}

if (errors.length) {
  console.error(`posts: ${errors.length} problem(s) in research posts:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

fs.rmSync(publicDir, { recursive: true, force: true });
for (const { slug, dir } of posts.values()) {
  for (const d of ASSET_DIRS) {
    const from = path.join(postsDir, dir, d);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(publicDir, slug, d), { recursive: true });
  }
}
const entries = [...posts.values()]
  .map(({ slug, dir }) => `  ${JSON.stringify(slug)}: () => import('@/content/posts/${dir}/site/index.mdx'),`)
  .join('\n');
fs.writeFileSync(registryFile, `// Generated by scripts/posts.mjs. Do not edit; not committed.
import type { MDXContent } from 'mdx/types';

export const postContent: Record<string, () => Promise<{ default: MDXContent }>> = {
${entries}
};
`);
console.log(`posts: ${posts.size} research post(s) ready${dev ? ' (including previews)' : ''}`);
