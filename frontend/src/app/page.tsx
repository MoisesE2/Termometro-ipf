'use client';

import { Thermometer } from '@/components/ui/Thermometer';
import { StatsCard } from '@/components/ui/StatsCard';
import { FaUsers, FaDollarSign, FaBullseye, FaChartLine, FaHeart } from 'react-icons/fa';
import { Cota } from '@/models/Cota';
import { Meta } from '@/models/Meta';

export default function Home() {
  // Mock de cotas
  const cotasMock: Cota[] = Array.from({ length: 15  }, (_, i) => ({
    id: i + 1,
    valor: 200,
    descricao: `Cota ${i + 1}`,
    data: '2025-07-01',
    responsavel: `Pessoa ${i + 1}`,
  }));

  const cotasArrecadadas = cotasMock.length;
  const valorArrecadado = cotasMock.reduce((total, cota) => total + cota.valor, 0);

  // Meta fixa
  const metaValor = 1200000;
  const cotasTotal = metaValor / 200;
  const porcentagemAlcancada = (valorArrecadado / metaValor) * 100;

  const meta: Meta = {
    metaValor,
    cotasTotal,
    cotasArrecadadas,
    valorArrecadado,
    porcentagemAlcancada,
    ultimaAtualizacao: new Date().toISOString(),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 relative">
      {/* Ícone de coração no canto superior direito */}
      <div className="absolute top-8 right-8 z-10">
        <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:shadow-lg transition-shadow">
          <FaHeart className="text-teal-500 text-xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Termômetro de Arrecadação
          </h1>
          <p className="text-2xl text-teal-600 italic mb-6">
            &ldquo;Alargando Fronteiras&rdquo;
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acompanhe em tempo real nosso progresso para a meta de{' '}
            <span className="font-semibold text-teal-700">
              {formatCurrency(meta.metaValor)}
            </span>
            !
          </p>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          {/* Termômetro */}
          <div className="lg:col-span-1 flex justify-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
              <Thermometer percentage={meta.porcentagemAlcancada} animated={true} />
            </div>
          </div>

          {/* Estatísticas */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Nosso Progresso
              </h2>
              <p className="text-center text-gray-600 mb-10 text-lg">
                Uma cota de {formatCurrency(200)} por um grande objetivo!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-10">
                <StatsCard
                  icon={<FaUsers className="text-4xl" />}
                  title="Cotas Alargadas"
                  value={`${meta.cotasArrecadadas.toLocaleString()} / ${meta.cotasTotal.toLocaleString()}`}
                />

                <StatsCard
                  icon={<FaDollarSign className="text-4xl" />}
                  title="Valor Arrecadado"
                  value={formatCurrency(meta.valorArrecadado)}
                />

                <StatsCard
                  icon={<FaBullseye className="text-4xl" />}
                  title="Meta"
                  value={formatCurrency(meta.metaValor)}
                />

                <StatsCard
                  icon={<FaChartLine className="text-4xl" />}
                  title="Alcançado"
                  value={`${meta.porcentagemAlcancada.toFixed(2)}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
