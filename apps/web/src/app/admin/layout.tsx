"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { buildApiUrl } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

      if (!token) {
        router.replace("/auth/login");
        return;
      }

      try {
        const res = await fetch(buildApiUrl("/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem("adminToken");
          router.replace("/auth/login");
          return;
        }
      } catch {
        router.replace("/auth/login");
        return;
      }

      setChecking(false);
    };

    verify();
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3FA34D] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-gray-50">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden
            pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))]
            lg:pt-0
            pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
