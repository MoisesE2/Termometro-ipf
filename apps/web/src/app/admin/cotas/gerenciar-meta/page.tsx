// app/admin/meta/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Meta } from "@/models/Meta";
import MetaCard from "@/components/metas/MetaCard";
import { fetchJson } from "@/lib/api";

export default function GestaoMetaPage() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await fetchJson("/stats/summary");
        if (!response.ok) {
          throw new Error("Falha ao carregar dados da meta.");
        }

        const data = (await response.json()) as {
          totalReceived?: number;
          totalQuotas?: number;
        };

        const metaValor = 1_200_000;
        const valorArrecadado = Number(data.totalReceived ?? 0);

        setMeta({
          metaValor,
          valorArrecadado,
          cotasArrecadadas: Number(data.totalQuotas ?? 0),
          cotasTotal: metaValor / 200,
          porcentagemAlcancada: (valorArrecadado / metaValor) * 100,
          ultimaAtualizacao: new Date().toISOString(),
        });
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os dados da meta.");
      }
    };

    loadMeta();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-[#1F5830] mb-10 text-center max-w-lg">
        Gestão de Meta
      </h1>

      {error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : meta ? (
        <div className="max-w-md w-full">
          <MetaCard meta={meta} />
        </div>
      ) : (
        <p className="text-center text-gray-500">Carregando...</p>
      )}
    </main>
  );
}
