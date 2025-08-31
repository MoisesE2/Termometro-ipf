// app/admin/meta/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Meta } from "@/models/Meta";
import MetaCard from "@/components/metas/MetaCard";
import MetaEditForm from "@/components/metas/MetaEditForm";

export default function GestaoMetaPage() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const mockMeta: Meta = {
      metaValor: 1200000,
      valorArrecadado: 58900, // Atualizado para R$ 58.900,00 - 294,5 cotas
      cotasArrecadadas: 294.5, // 58900 / 200 = 294,5 cotas
      cotasTotal: 6000,
      porcentagemAlcancada: (58900 / 1200000) * 100, // 4.91%
      ultimaAtualizacao: new Date().toISOString(),
    };
    setMeta(mockMeta);
  }, []);

  const atualizarMeta = async (novaMetaValor: number) => {
    setMeta((prev) =>
      prev ? { ...prev, metaValor: novaMetaValor } : null
    );
    setEditando(false);
    alert("Meta atualizada com sucesso!");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-[#1F5830] mb-10 text-center max-w-lg">
        Gestão de Meta
      </h1>

      {meta ? (
        <>
          {!editando ? (
            <>
              <div className="max-w-md w-full">
                <MetaCard meta={meta} />
              </div>

              <button
                onClick={() => setEditando(true)}
                className="mt-10 px-8 py-3 bg-[#3FA34D] hover:bg-[#33913F] text-white rounded-lg font-semibold shadow-md transition focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:ring-offset-2"
              >
                Editar Meta
              </button>
            </>
          ) : (
            <div className="max-w-md w-full">
              <MetaEditForm
                valorAtual={meta.metaValor}
                onCancel={() => setEditando(false)}
                onSave={atualizarMeta}
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">Carregando...</p>
      )}
    </main>
  );
}
