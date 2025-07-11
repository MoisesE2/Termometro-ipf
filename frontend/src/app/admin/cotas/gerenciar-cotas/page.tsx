"use client";

import { useState } from "react";
import CotaCard from "@/components/cotas/CotaCard";
import CotaSearch from "@/components/cotas/CotaSearch";
import CotaForm from "@/components/cotas/CotaForm";
import { Cota } from "@/models/Cota";

export default function GerenciarCotasPage() {
  const [cotas, setCotas] = useState<Cota[]>([
    { valor: 50, responsavel: "Maria", data: "2025-07-11", descricao: "Oferta especial" },
    { valor: 75, responsavel: "João", data: "2025-07-10", descricao: "Campanha Junho" },
  ]);

  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState<Cota | null>(null);

  const handleDelete = (id: number) => {
    setCotas((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEdit = (cota: Cota) => {
    setEditando(cota);
  };

  const handleUpdate = (cotaAtualizada: Cota) => {
    setCotas((prev) =>
      prev.map((c) => (c.id === cotaAtualizada.id ? cotaAtualizada : c))
    );
    setEditando(null);
  };

  const cotasFiltradas = cotas.filter((c) =>
    c.responsavel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-3xl mx-auto mt-12 px-4">
      <h1 className="text-3xl font-bold text-[#1F5830] mb-6">Gerenciar Cotas</h1>

      <CotaSearch search={search} setSearch={setSearch} />

      {editando && (
        <CotaForm
          initialData={editando}
          onCancel={() => setEditando(null)}
          onSubmit={handleUpdate}
        />
      )}

      {cotasFiltradas.map((cota) => (
        <CotaCard
          key={cota.id}
          cota={cota}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      {cotasFiltradas.length === 0 && (
        <p className="text-center text-gray-500 mt-8">Nenhuma cota encontrada.</p>
      )}
    </main>
  );
}
