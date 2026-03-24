"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { buildApiUrl } from "@/lib/api";
import { FaLock, FaEnvelope } from "react-icons/fa";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      if (res.status === 502) {
        let detail = "";
        try {
          const body = await res.json();
          detail = body.detail ? ` (${body.detail})` : body.message ? ` — ${body.message}` : "";
        } catch { /* noop */ }
        setErrorMessage(`Servidor de API inacessível${detail}. Verifique a configuração em /api/proxy-health`);
        return;
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Resposta inválida da API (status ${res.status}).`);
      }

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Usuário ou senha inválidos.");
        return;
      }

      auth.setToken(data.token);
      router.push("/admin/dashboard");
    } catch {
      setErrorMessage("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1F5830] via-[#2d7a44] to-[#163d22] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-10 flex flex-col items-center text-center">
          <Image
            src="/assets/CRUZ.png"
            alt="Logo IPF"
            width={100}
            height={100}
            className="mb-8 drop-shadow-2xl"
            priority
          />
          <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">
            IPF Farol
          </h1>
          <p className="text-green-200 text-lg italic mb-8">
            &quot;Alargando Fronteiras&quot;
          </p>
          <div className="w-16 h-0.5 bg-green-300/50 rounded-full mb-8" />
          <p className="text-green-100/80 text-sm leading-relaxed max-w-xs">
            Painel administrativo do Termômetro de Arrecadação. Gerencie cotas e acompanhe o progresso da meta.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Image
              src="/assets/CRUZ.png"
              alt="Logo IPF"
              width={64}
              height={64}
              className="mb-4"
              priority
            />
            <h1 className="text-2xl font-bold text-[#1F5830]">IPF Farol</h1>
            <p className="text-gray-500 text-sm italic">Alargando Fronteiras</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Bem-vindo</h2>
              <p className="text-gray-500 text-sm">
                Entre com suas credenciais de administrador
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Senha
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1F5830] hover:bg-[#163d22] text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>

          {/* suppressHydrationWarning evita React #418: getFullYear() varia entre SSR e hidratação */}
          <p className="text-center text-gray-400 text-xs mt-6" suppressHydrationWarning>
            © {new Date().getFullYear()} Igreja Presbiteriana do Farol
          </p>
        </div>
      </div>
    </div>
  );
}
