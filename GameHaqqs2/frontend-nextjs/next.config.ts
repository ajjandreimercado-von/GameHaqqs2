import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '/media/**',
      },
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
};

export default nextConfig;

