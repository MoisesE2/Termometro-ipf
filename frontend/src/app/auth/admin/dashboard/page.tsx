import { FeatureBanner } from "@/components/FeatureBanner";
import { FaChartLine, FaCogs, FaTasks } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col gap-6 items-center">
      {/* Registro de Cota */}
      <FeatureBanner
        title="Registro de Cota"
        description="Registre cada oferta que nos aproxima da meta"
        buttonText="Registrar"
        icon={<FaChartLine />}
      />

      {/* Gestão de Cotas */}
      <FeatureBanner
        title="Gestão de Cotas"
        description="Revise e gerencie todas as contribuições registradas."
        buttonText="Gerenciar"
        icon={<FaTasks />}
      />

      {/* Gestão de Meta */}
      <FeatureBanner
        title="Gestão de Meta"
        description="Configure o valor total que buscamos alcançar."
        buttonText="Gerenciar"
        icon={<FaCogs />}
      />
    </div>
  );
}
