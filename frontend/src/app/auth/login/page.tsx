// src/app/admin/login/page.tsx
"use client"; // Marca como Client Component para usar hooks de estado de UI

import React, { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Descomente se quiser redirecionar

// Componente visual do formulário de login
const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Para exibir mensagens de erro visuais

  // Simulação de submissão do formulário (apenas visual)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Usuário ou senha inválidos.');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      // Redirecione para o dashboard do admin, se desejar:
      // router.push('/admin/dashboard');
    } catch {
      setErrorMessage('Erro de conexão com o servidor');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 sm:p-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Login do Administrador
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-teal-500 text-white font-semibold rounded-md shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

// A página em si (src/app/admin/login/page.tsx)
export default function AdminLoginPage() {
  // Em um cenário real, você verificaria o token JWT aqui e redirecionaria
  // const router = useRouter();
  // React.useEffect(() => {
  //   const token = localStorage.getItem('adminToken');
  //   if (token) {
  //     router.push('/admin/dashboard');
  //   }
  // }, [router]);

  return <LoginForm />;
}