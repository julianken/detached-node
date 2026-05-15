import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,

  // Performance optimizations
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['@payloadcms/richtext-lexical'],
  },

  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year for immutable images
    localPatterns: [
      // Pre-cloud-storage media docs (local-disk fallback, test seed): no query string.
      { pathname: '/api/media/file/**', search: '' },
      // Cloud-storage adapter (S3-compatible) appends ?prefix=media to media URLs.
      { pathname: '/api/media/file/**', search: '?prefix=media' },
    ],
    remotePatterns: process.env.GCS_BUCKET
      ? [
          {
            protocol: 'https',
            hostname: 'storage.googleapis.com',
            // Pinned to our exact bucket name — prevents /_next/image from
            // becoming an open re-encoding proxy. picomatch's `*` would match
            // any -suffixed bucket, which an attacker can create.
            pathname: `/${process.env.GCS_BUCKET}/media/**`,
          },
        ]
      : [],
  },

  async redirects() {
    return [
      {
        source: '/failure-modes',
        destination: '/posts/',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
