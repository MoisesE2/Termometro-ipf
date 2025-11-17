import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configurações mínimas para produção
  output: 'standalone',
  // Configuração para evitar problemas com SSR
  reactStrictMode: false,
  // Configurações para melhor compatibilidade com Docker
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configurações básicas
  poweredByHeader: false,
  trailingSlash: false,
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
