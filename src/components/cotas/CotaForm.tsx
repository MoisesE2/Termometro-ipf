import { Cota } from "@/models/Cota";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  initialData: Cota | null;
  onCancel: () => void;
  onSubmit: (cota: Cota) => void;
}

export default function CotaForm({ initialData, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<Cota>({
    id: initialData?.id,
    valor: initialData?.valor || 0,
    descricao: initialData?.descricao || "",
    data: initialData?.data || "",
    responsavel: initialData?.responsavel || "",
    imagem: initialData?.imagem || null,
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0] || null;
  //   setForm((prev) => ({ ...prev, imagem: file }));
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-md mb-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Editar Cota</h2>

      <input
        type="number"
        name="valor"
        value={form.valor}
        onChange={handleChange}
        placeholder="Valor"
        className="w-full mb-3 p-2 border rounded"
        required
        step="0.01"
      />
      <input
        type="text"
        name="responsavel"
        value={form.responsavel}
        onChange={handleChange}
        placeholder="Responsável"
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <input
        type="date"
        name="data"
        value={form.data}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />
      <textarea
        name="descricao"
        value={form.descricao}
        onChange={handleChange}
        placeholder="Descrição"
        className="w-full mb-3 p-2 border rounded"
        required
      />

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
  {form.imagem && typeof form.imagem !== "string" && (
    <Image
      src={URL.createObjectURL(form.imagem)}
      alt="Pré-visualização"
      width={160}
      height={120}
      className="w-40 mt-2 rounded-md shadow object-cover"
    />
  )}

  {/* Caso imagem seja uma URL string (exemplo: imagem já salva no backend) */}
  {form.imagem && typeof form.imagem === "string" && (
    <Image
      src={form.imagem}
      alt="Imagem atual"
      width={160}
      height={120}
      className="w-40 mt-2 rounded-md shadow object-cover"
    />
  )}
</div>


      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
          Salvar
        </button>
      </div>
    </form>
  );
}
