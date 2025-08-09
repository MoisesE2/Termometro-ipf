import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Desabilitar o botão de visualização do Next.js
  devIndicators: {
    position: 'bottom-right',
  },
  // Configurações para produção
  output: 'standalone',
  outputFileTracingIncludes: {
    '/': ['./public/**/*'],
  },
  // Configuração para evitar problemas com SSR
  reactStrictMode: true,
  // Configuração para páginas estáticas
  trailingSlash: false,
  // Configuração para evitar problemas com componentes HTML
  poweredByHeader: false,
  // Configurações para melhor compatibilidade com Docker
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
