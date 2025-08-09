// components/CotaCard.tsx
import React from "react";
import { Cota } from "@/models/Cota";

interface Props {
  cota: Cota;
  onEdit: (cota: Cota) => void;
  onDelete: (id: string) => void;
}

export default function CotaCard({ cota, onEdit, onDelete }: Props) {
  return (
    <div className="border border-gray-200 p-6 rounded-lg shadow-md bg-white mb-6 hover:shadow-lg transition-shadow">
      <p className="text-gray-700 mb-1">
        <strong>Valor:</strong> R$ {Number(cota.valor).toFixed(2)}
      </p>
      <p className="text-gray-700 mb-1">
        <strong>Responsável:</strong> {cota.responsavel}
      </p>
      <p className="text-gray-700 mb-1">
        <strong>Data:</strong> {cota.data}
      </p>
      <p className="text-gray-700">
        <strong>Descrição:</strong> {cota.descricao}
      </p>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => onEdit(cota)}
          className="px-5 py-2 bg-[#3FA34D] hover:bg-[#33913F] text-white rounded-lg font-semibold shadow-md transition focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:ring-offset-2"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(cota.id!)}
          className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold shadow-md transition focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
        >
          Deletar
        </button>
      </div>
    </div>
  );
}
