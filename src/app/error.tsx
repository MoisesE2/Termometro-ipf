'use client'
 
import { useEffect } from 'react'
import Link from 'next/link'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error(error)
  }, [error])
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Erro</h1>
          <h2 className="text-xl font-semibold text-slate-600 mb-4">
            Algo deu errado!
          </h2>
          <p className="text-slate-500 mb-8">
            Ocorreu um erro durante o carregamento da página.
          </p>
        </div>
        
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 mr-4"
        >
          Tentar Novamente
        </button>
        
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all duration-200"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  )
}
