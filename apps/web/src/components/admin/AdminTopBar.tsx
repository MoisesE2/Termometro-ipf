"use client";

import { auth } from "@/lib/auth";
import { FaSignOutAlt } from "react-icons/fa";

/**
 * Barra superior com ação de sair sempre visível (mobile e desktop),
 * sem precisar abrir o menu ou rolar até o fim da sidebar.
 */
export default function AdminTopBar() {
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminUser");
    }
    auth.logout();
  };

  return (
    <header
      className="sticky top-0 z-[58] flex items-center justify-end gap-2 border-b border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90
        pt-[max(0.35rem,env(safe-area-inset-top))]
        pb-2
        pl-[max(3.75rem,env(safe-area-inset-left))]
        pr-[max(0.75rem,env(safe-area-inset-right))]
        lg:px-6 lg:py-3 lg:pl-6"
    >
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 hover:border-red-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="Sair da conta"
      >
        <FaSignOutAlt className="h-4 w-4" aria-hidden />
        <span>Sair</span>
      </button>
    </header>
  );
}
