'use client';
import { FeatureBanner } from "@/components/ui/FeatureBanner";
import { useRouter } from "next/navigation";
import { FaChartLine, FaCogs, FaTasks } from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();

  // 🎯 Funções para cada botão
  const goToRegistrarCota = () => router.push('/admin/cotas/registrar-cotas');
  const goToGerenciarCotas = () => router.push('/admin/cotas/gerenciar-cotas');
  const goToGerenciarMeta = () => router.push('/admin/cotas/gerenciar-meta');
  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col gap-6 items-center">
      {/* Registro de Cota */}
      <FeatureBanner
        title="Registro de Cota"
        description="Registre cada oferta que nos aproxima da meta"
        buttonText="Registrar"
        icon={<FaChartLine />}
        onButtonClick={goToRegistrarCota}
      />

      {/* Gestão de Cotas */}
      <FeatureBanner
        title="Gestão de Cotas"
        description="Revise e gerencie todas as contribuições registradas."
        buttonText="Gerenciar"
        icon={<FaTasks />}
        onButtonClick={goToGerenciarCotas}
      />

      {/* Gestão de Meta */}
      <FeatureBanner
        title="Gestão de Meta"
        description="Configure o valor total que buscamos alcançar."
        buttonText="Gerenciar"
        icon={<FaCogs />}
        onButtonClick={goToGerenciarMeta}
      />
    </div>
  );
}
