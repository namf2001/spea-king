import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Enable inline CSS for better performance
    inlineCss: true,

    // Enable view transitions for smoother navigation (works with stable Next.js)
    viewTransition: true,

    // Remove PPR and cache features that require canary version
    // ppr: true,
    // useCache: true,
    // clientSegmentCache: true,
  },
};

export default nextConfig;
