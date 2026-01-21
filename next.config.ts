import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Skip database access during build
    ...(process.env.NEXT_PHASE === 'phase-production-build' && {
      workerThreads: false,
      cpus: 1,
    }),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
