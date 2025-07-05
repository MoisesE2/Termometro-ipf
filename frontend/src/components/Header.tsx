// src/components/Header.tsx
"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Importe a imagem diretamente do caminho especificado
// Certifique-se de que o caminho está correto em relação a este arquivo Header.tsx
// Se Header.tsx está em src/components, e a imagem está em src/app/assets,
// o caminho relativo seria '../../app/assets/IPF.png'
import IPFLogo from '../app/assets/IPF.png'

// Se for usar navegação programática em um cenário real:
// import { useRouter } from 'next/navigation';

interface HeaderProps {
  // Para controlar o estado de login externamente (via props ou Context API)
  // isLoggedIn?: boolean;
  // onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  // Estado local para simular o login/logout apenas para o visual do Header.
  // Em uma aplicação real, você usaria um contexto de autenticação global.
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Mude para true para testar o visual de "Painel Admin"

  // Exemplo de como lidaria com cliques em um cenário real
  const handleLoginClick = () => {
    console.log('Simulando navegação para /admin/login');
    // Para navegação real: useRouter().push('/admin/login');
  };

  const handleLogoutClick = () => {
    console.log('Simulando Logout e navegação para /');
    setIsLoggedIn(false); // Apenas para simulação
    // Para logout real: Chamar a função de logout do seu AuthContext/Serviço
    // e então useRouter().push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 p-3 sm:px-6">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Título - Lado Esquerdo */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            {/* Usando a imagem importada diretamente */}
            <Image
              src={IPFLogo} // <--- AGORA USA A VARIÁVEL IMPORTADA
              alt="Logo Termômetro IPF"
              width={40} // Ajuste o tamanho conforme o design da imagem (largura)
              height={40} // Ajuste o tamanho conforme o design da imagem (altura)
              // className="rounded-full" // Opcional, se sua logo for circular
              priority // Opcional: para carregar a logo mais rapidamente
            />
          </Link>
        </div>

        {/* Navegação e Botões de Autenticação - Lado Direito */}
        <nav className="flex items-center space-x-4 sm:space-x-6">
          {/* Link para a Página Principal */}
          <Link
            href="/"
            className="text-gray-800 hover:text-teal-500 transition-colors duration-200 text-base sm:text-lg font-medium"
          >
            Página Principal
          </Link>

          {/* Botões de Login/Painel Admin/Logout (Renderização Condicional Simulada) */}
          {isLoggedIn ? (
            // Se logado como admin
            <div className="flex items-center space-x-4">
              <Link
                href="auth/admin/dashboard"
                className="text-gray-800 hover:text-teal-500 transition-colors duration-200 text-base sm:text-lg font-medium"
              >
                Painel Admin
              </Link>
              <button
                onClick={handleLogoutClick}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-white border border-gray-200 text-red-500 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200 text-sm sm:text-base font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            // Se não logado
            <button
              onClick={handleLoginClick}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-white border border-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-50 hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors duration-200 text-sm sm:text-base font-medium"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;