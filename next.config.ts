import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Essays used to live at /blog; keep old links working.
  async redirects() {
    return [
      { source: '/blog', destination: '/essays', permanent: true },
      { source: '/blog/:slug', destination: '/essays/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
