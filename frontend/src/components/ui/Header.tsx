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
  );
};

export default Header;
