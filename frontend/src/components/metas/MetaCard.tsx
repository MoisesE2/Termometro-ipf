// components/MetaCard.tsx
import { Meta } from "@/models/Meta";

export default function MetaCard({ meta }: { meta: Meta }) {
  return (
    <section className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-[#1F5830] mb-6 border-b border-[#3FA34D] pb-2">
        Informações da Meta
      </h2>

      <div className="space-y-3 text-gray-700 font-medium text-lg">
        <p>
          <span className="text-[#3FA34D]">Meta:</span>{" "}
          R$ {meta.metaValor.toLocaleString("pt-BR")}
        </p>
        <p>
          <span className="text-[#3FA34D]">Valor Arrecadado:</span>{" "}
          R$ {meta.valorArrecadado.toLocaleString("pt-BR")}
        </p>
        <p>
          <span className="text-[#3FA34D]">Cotas Alargadas:</span>{" "}
          {meta.cotasArrecadadas} / {meta.cotasTotal}
        </p>
        <p>
          <span className="text-[#3FA34D]">Alcançado:</span>{" "}
          {meta.porcentagemAlcancada.toFixed(2)}%
        </p>
      </div>

      <p className="mt-6 text-sm text-gray-500 text-right italic">
        Última atualização: {new Date(meta.ultimaAtualizacao).toLocaleString("pt-BR")}
      </p>
    </section>
  );
}
