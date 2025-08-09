import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-slate-600 mb-4">
            Página não encontrada
          </h2>
          <p className="text-slate-500 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  )
}
