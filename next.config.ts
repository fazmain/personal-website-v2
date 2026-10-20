import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Essays used to live at /blog; keep old links working.
  async redirects() {
    return [
      { source: '/blog', destination: '/essays', permanent: true },
      { source: '/blog/:slug', destination: '/essays/:slug', permanent: true },
    ];
  },
};

// MDX is used for research posts imported from research repos (see POSTS.md).
// Plugins are named as strings so they work with Turbopack.
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm', 'remark-math'],
    rehypePlugins: [['rehype-katex', { strict: false }]],
  },
});

export default withMDX(nextConfig);
