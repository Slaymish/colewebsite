import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Exclude Sanity CLI and studio files from the Next.js build where not needed
  experimental: {
    // Improve page discovery
    typedRoutes: false,
  },
}

export default nextConfig
