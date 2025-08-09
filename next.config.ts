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
}

export default nextConfig
