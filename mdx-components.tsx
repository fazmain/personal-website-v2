import type { MDXComponents } from 'mdx/types';

// Required by @next/mdx. Post components are passed per post in
// app/research/[slug]/page.tsx because they depend on the post's files and facts.
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
