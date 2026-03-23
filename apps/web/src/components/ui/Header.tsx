// src/components/Header.tsx
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

import { useRouter } from 'next/navigation';

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  // Estado local para simular o login/logout apenas para o visual do Header.
  // Em uma aplicação real, você usaria um contexto de autenticação global.
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Mude para true para testar o visual de "Painel Admin"
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [showTerreno, setShowTerreno] = React.useState(false);

  const router = useRouter();

  React.useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 10) {
          // Scrolling down
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);
      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [lastScrollY]);

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  const handleLogoutClick = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <>
      <header className={`bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-2 sm:p-3 lg:px-4 sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          {/* Logo/Título - Lado Esquerdo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
              {/* Usando a imagem do public/assets */}
              <Image
                src="/assets/CRUZ.png"
                alt="Logo Termômetro IPF"
                width={36}
                height={36}
                className="sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                priority
              />
              <span className="hidden sm:block text-base lg:text-lg font-medium text-slate-700">
                Termômetro IPF
              </span>
            </Link>
          </div>

          {/* Navegação e Botões de Autenticação - Lado Direito */}
          <nav className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            {/* Botão do Terreno */}
            <button
              onClick={() => setShowTerreno(true)}
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              aria-label="Ver imagem do terreno"
              title="Ver imagem do terreno"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Link para a Página Principal */}
            <Link
              href="/"
              className="text-slate-600 hover:text-[#0F4D2E] transition-colors duration-200 text-sm sm:text-base font-normal px-2 py-1 rounded-md hover:bg-slate-50"
            >
              <span className="hidden sm:inline">Início</span>
              <span className="sm:hidden text-xs">Início</span>
            </Link>

            {/* Botões de Login/Painel Admin/Logout (Renderização Condicional Simulada) */}
            {isLoggedIn ? (
              // Se logado como admin
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  href="/admin/dashboard"
                  className="text-slate-600 hover:text-slate-800 transition-colors duration-200 text-sm sm:text-base font-normal px-2 py-1 rounded-md hover:bg-slate-50"
                >
                  <span className="hidden sm:inline">Painel</span>
                  <span className="sm:hidden text-xs">Painel</span>
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="px-2 py-1 sm:px-3 sm:py-2 bg-transparent border border-slate-200 text-slate-500 rounded-md hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all duration-200 text-xs sm:text-sm font-normal"
                >
                  <span className="hidden sm:inline">Sair</span>
                  <span className="sm:hidden text-xs">Sair</span>
                </button>
              </div>
            ) : (
              // Se não logado
              <button 
                onClick={handleLoginClick}
                className="px-2 py-1 sm:px-3 sm:py-2 bg-transparent border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 text-xs sm:text-sm font-normal"
              >
                <span className="hidden sm:inline">Entrar</span>
                <span className="sm:hidden text-xs">Entrar</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Modal do Terreno */}
      {showTerreno && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4 animate-fadeIn"
          tabIndex={-1}
          onClick={() => setShowTerreno(false)}
          onKeyDown={e => { if (e.key === 'Escape') setShowTerreno(false); }}
        >
                     <div 
             className="relative bg-white/95 rounded-3xl p-6 md:p-10 max-w-6xl w-full mx-auto shadow-xl border-2 border-emerald-200/70 animate-scaleIn transition-all duration-300"
             onClick={e => e.stopPropagation()}
           >
            {/* Botão de fechar */}
            <button
              onClick={() => setShowTerreno(false)}
              aria-label="Fechar modal"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

                         <div className="flex flex-col items-center gap-6 w-full">
               <div className="hover:scale-105 transition-transform duration-200 cursor-pointer w-full flex justify-center"
                  onClick={() => setShowTerreno(false)}
                >
                  <Image
                    src="/assets/terreno.jpg"
                    alt="Anexo 3 da Igreja Presbiteriana do Farol"
                    width={1000}
                    height={800}
                    className="w-full h-auto max-w-[1000px] max-h-[80vh] mx-auto drop-shadow-lg object-contain rounded-lg"
                    priority
                  />
                </div>
               
               <h3 className="text-2xl font-semibold tracking-wide text-emerald-700 text-center">
                 Anexo 3 da Igreja Presbiteriana do Farol
               </h3>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
