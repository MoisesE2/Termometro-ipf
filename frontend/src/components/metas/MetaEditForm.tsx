// components/MetaEditForm.tsx
import { useState } from "react";

interface Props {
  valorAtual: number;
  onCancel: () => void;
  onSave: (novoValor: number) => void;
}

export default function MetaEditForm({ valorAtual, onCancel, onSave }: Props) {
  const [valor, setValor] = useState(valorAtual);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(valor);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto space-y-6"
    >
      <h2 className="text-xl font-semibold text-[#1F5830] border-b border-[#3FA34D] pb-2 mb-4">
        Editar Meta de Arrecadação
      </h2>

      <label className="block font-semibold text-gray-700 text-lg">
        Nova Meta (R$)
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          required
          className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 text-lg
                     focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:border-[#3FA34D]"
        />
      </label>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-md bg-[#3FA34D] hover:bg-[#33913F] text-white font-semibold transition"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
