"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaChartLine,
  FaTasks,
  FaCogs,
  FaPlus,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <FaChartLine className="w-4 h-4" />,
  },
  {
    label: "Registrar Cota",
    href: "/admin/cotas/registrar-cotas",
    icon: <FaPlus className="w-4 h-4" />,
  },
  {
    label: "Gerenciar Cotas",
    href: "/admin/cotas/gerenciar-cotas",
    icon: <FaTasks className="w-4 h-4" />,
  },
  {
    label: "Gerenciar Meta",
    href: "/admin/cotas/gerenciar-meta",
    icon: <FaCogs className="w-4 h-4" />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/auth/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="flex-shrink-0">
          <Image
            src="/assets/CRUZ.png"
            alt="Logo IPF"
            width={36}
            height={36}
            className="drop-shadow"
          />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Painel Admin</p>
          <p className="text-green-300 text-xs">IPF Alargando Fronteiras</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-green-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`transition-colors ${
                  isActive ? "text-green-300" : "text-green-400 group-hover:text-green-300"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
        >
          <FaSignOutAlt className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle — safe-area + área de toque maior */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed z-[60] lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#1F5830] text-white shadow-lg active:scale-95 transition-transform
          top-[max(0.75rem,env(safe-area-inset-top))]
          left-[max(0.75rem,env(safe-area-inset-left))]"
        aria-label="Abrir menu"
        aria-expanded={mobileOpen}
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer — largura máxima confortável + scroll interno */}
      <aside
        className={`fixed inset-y-0 left-0 z-[56] w-[min(18rem,100vw-2rem)] max-w-[min(18rem,calc(100vw-env(safe-area-inset-left)-env(safe-area-inset-right)))] bg-gradient-to-b from-[#1F5830] to-[#163d22] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto overscroll-contain ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-safe pl-safe pr-safe pb-safe min-h-full">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 hover:text-white rounded-lg"
            aria-label="Fechar menu"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 bg-gradient-to-b from-[#1F5830] to-[#163d22] shadow-xl min-h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
