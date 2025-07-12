"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cota } from "@/models/Cota";
import Image from "next/image";

export default function RegistrarCotaPage() {
  const router = useRouter();
  const [form, setForm] = useState<Cota>({
    valor: 0,
    descricao: "",
    data: "",
    responsavel: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aqui você pode enviar para API futuramente
    console.log("Cota enviada:", form);

    alert("Cota registrada com sucesso!");
    router.push("/admin/dashboard"); // volta ao painel
  };

  return (
    <main className="max-w-3xl mx-auto mt-12 bg-white shadow-lg p-8 rounded-xl">
      <h1 className="text-3xl font-bold text-[#1F5830] mb-6">
        Registrar Nova Cota
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="valor"
            className="block text-sm font-medium text-gray-700"
          >
            Valor (R$)
          </label>
          <input
            type="number"
            name="valor"
            id="valor"
            value={form.valor}
            onChange={handleChange}
            required
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-[#3FA34D] focus:border-[#3FA34D]"
          />
        </div>

        <div>
          <label
            htmlFor="descricao"
            className="block text-sm font-medium text-gray-700"
          >
            Descrição
          </label>
          <textarea
            name="descricao"
            id="descricao"
            value={form.descricao}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-[#3FA34D] focus:border-[#3FA34D]"
          />
        </div>

        <div>
          <label
            htmlFor="data"
            className="block text-sm font-medium text-gray-700"
          >
            Data da Oferta
          </label>
          <input
            type="date"
            name="data"
            id="data"
            value={form.data}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-[#3FA34D] focus:border-[#3FA34D]"
          />
        </div>

        <div>
          <label
            htmlFor="responsavel"
            className="block text-sm font-medium text-gray-700"
          >
            Responsável
          </label>
          <input
            type="text"
            name="responsavel"
            id="responsavel"
            value={form.responsavel}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-[#3FA34D] focus:border-[#3FA34D]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagem Comprovante (opcional)
          </label>

          {/* Input file escondido */}
          <input
            type="file"
            accept="image/*"
            id="imagem-upload"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                imagem: e.target.files?.[0] || null,
              }))
            }
            className="hidden"
          />

          {/* Botão customizado para abrir o file picker */}
          <label
            htmlFor="imagem-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m-5 4h18"
              />
            </svg>
            <span>Anexar imagem</span>
          </label>

          {/* Pré-visualização da imagem */}
          {form.imagem && (
            <Image
              src={URL.createObjectURL(form.imagem)}
              alt="Pré-visualização"
              width={160}
              height={120}
              className="w-40 mt-2 rounded-md shadow object-cover"
            />
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#3FA34D] hover:bg-[#33913F] text-white rounded-md font-medium"
          >
            Registrar
          </button>
        </div>
      </form>
    </main>
  );
}