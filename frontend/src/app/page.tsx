'use client';

import { useState } from 'react';
import { Thermometer } from '@/components/Thermometer';
import { StatsCard } from '@/components/StatsCard';
import { FaUsers, FaDollarSign, FaBullseye, FaChartLine, FaHeart } from 'react-icons/fa';

export default function Home() {
  const [currentQuotas, setCurrentQuotas] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Configurações da meta
  const totalQuotas = 6000;
  const quotaValue = 200; // R$ 200,00 por cota
  const goalAmount = totalQuotas * quotaValue; // R$ 1.200.000,00
  
  // Cálculos baseados nas cotas atuais
  const raisedAmount = currentQuotas * quotaValue;
  const percentage = (currentQuotas / totalQuotas) * 100;

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para iniciar simulação
  const handleStartSimulation = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    const duration = 5000; // 5 segundos
    const targetQuotas = Math.floor(Math.random() * 1000) + 500; // Entre 500 e 1500 cotas
    const steps = 50;
    const increment = targetQuotas / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const newQuotas = Math.floor(increment * currentStep);
      setCurrentQuotas(prev => Math.min(prev + newQuotas, totalQuotas));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, duration / steps);
  };

  // Função para reiniciar
  const handleReset = () => {
    setCurrentQuotas(0);
    setIsSimulating(false);
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
              {formatCurrency(goalAmount)}
            </span>
            !
          </p>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          {/* Termômetro - Centralizado */}
          <div className="lg:col-span-1 flex justify-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
              <Thermometer percentage={percentage} animated={true} />
            </div>
          </div>

          {/* Estatísticas - Lado direito */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Nosso Progresso
              </h2>
              <p className="text-center text-gray-600 mb-10 text-lg">
                Uma cota de {formatCurrency(quotaValue)} por um grande objetivo!
              </p>

              {/* Grid de Estatísticas */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <StatsCard
                  icon={<FaUsers className="text-4xl" />}
                  title="Cotas Alargadas"
                  value={`${currentQuotas.toLocaleString()} / ${totalQuotas.toLocaleString()}`}
                />
                
                <StatsCard
                  icon={<FaDollarSign className="text-4xl" />}
                  title="Valor Arrecadado"
                  value={formatCurrency(raisedAmount)}
                />
                
                <StatsCard
                  icon={<FaBullseye className="text-4xl" />}
                  title="Meta"
                  value={formatCurrency(goalAmount)}
                />
                
                <StatsCard
                  icon={<FaChartLine className="text-4xl" />}
                  title="Alcançado"
                  value={`${percentage.toFixed(2)}%`}
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartSimulation}
                  disabled={isSimulating}
                  className={`flex-1 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                    isSimulating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#1F5830] hover:bg-teal-600 hover:scale-105 active:scale-95'
                  } text-white shadow-lg`}
                >
                  {isSimulating ? 'Simulando...' : 'Iniciar Simulação'}
                </button>
                
                <button
                  onClick={handleReset}
                  disabled={isSimulating}
                  className={`flex-1 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                    isSimulating
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50 hover:scale-105 active:scale-95 border-2 border-gray-300'
                  } text-gray-700 shadow-lg`}
                >
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
