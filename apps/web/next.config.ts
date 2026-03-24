import type { NextConfig } from 'next'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'

/** Raiz do monorepo (apps/web → ../..) — alinha tracing/node_modules no dev/build. */
const monorepoRoot = path.resolve(__dirname, '..', '..')

const nextConfig: NextConfig = {
  serverExternalPackages: ['exceljs'],

  experimental: {
    optimizePackageImports: ['react-icons', 'recharts'],
  },

  outputFileTracingRoot: monorepoRoot,

  webpack: (config, { dev }) => {
    if (dev) {
      // Evita ENOENT em .next/cache/webpack/.../*.pack.gz (cache em disco corrompido no HMR)
      type WithCache = { cache?: false | object }
      ;(config as WithCache).cache = false
    }
    return config
  },

  ...(isProd ? { output: 'standalone' as const } : {}),

  reactStrictMode: true,
  compiler: {
    removeConsole: isProd,
  },
  poweredByHeader: false,
  trailingSlash: false,
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) return [];

    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3001/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
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

export default nextConfig
