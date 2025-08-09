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
}

export default nextConfig
