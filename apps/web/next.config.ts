import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configurações mínimas para produção
  output: 'standalone',
  // Configuração para evitar problemas com SSR
  reactStrictMode: true,
  // Configurações para melhor compatibilidade com Docker
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configurações básicas
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
  // Configurações de segurança
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
