'use client';

import { Thermometer } from '@/components/ui/Thermometer';
import { FaUsers, FaDollarSign, FaBullseye, FaChartLine, FaQrcode } from 'react-icons/fa';
import { Cota } from '@/models/Cota';
import { Meta } from '@/models/Meta';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [showQRCode, setShowQRCode] = useState(false);

  // Mock de cotas
  const cotasMock: Cota[] = Array.from({ length: 30  }, (_, i) => ({
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 py-2 px-2 relative overflow-hidden flex flex-col">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "url(data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E)",
        }}
        aria-hidden="true"
      />      
      <div className="max-w-7xl mx-auto relative z-10 px-4 flex flex-col min-h-screen pt-20">
        {/* Header com imagem à esquerda */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3 lg:mb-4">
            <Image
              src="/assets/CRUZ.png"
              alt="Logo IPF"
              width={80}
              height={80}
              className="flex-shrink-0"
              priority
            />
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-wide bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2 lg:mb-3 leading-tight">
                Medidor de Arrecadação
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-teal-600 font-medium italic">
                &ldquo;Alargando Fronteiras&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-x-8 w-full items-stretch pb-3">
          {/* Termômetro */}
          <div className="flex-1 bg-gradient-to-b from-white via-white to-emerald-8 rounded-2xl lg:rounded-3xl shadow-lg p-6 lg:p-10 border border-white/40 w-full max-w-md hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col gap-6 items-center min-h-0">
            <div className="text-center mb-2 md:mb-2">
              <h3 className="text-base lg:text-lg font-bold tracking-wide text-slate-800 mb-1">Barra de Progresso</h3>
              <p className="text-xs text-gray-700">Meta de arrecadação</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Thermometer percentage={meta.porcentagemAlcancada} animated={true} />
            </div>
          </div>

          {/* Estatísticas */}
          <div className="flex-[2.3] bg-gradient-to-b from-white via-white to-emerald-8 rounded-2xl lg:rounded-3xl shadow-lg p-6 lg:p-10 border border-white/40 w-full lg:max-w-2xl max-w-md hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col gap-6 items-center min-h-[320px]">
            <div className="text-center mb-3">
              <h2 className="text-base md:text-lg lg:text-2xl font-bold tracking-wide text-slate-800 mb-1">
                Estatísticas
              </h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mx-auto mb-2"></div>
              <p className="text-xs text-slate-600 leading-relaxed px-1">
                Cada cota de {formatCurrency(200)} nos aproxima do objetivo!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-grow">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 md:p-5 border border-emerald-100/50 hover:shadow-md transition-all duration-300 flex flex-col justify-center">
                <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-2 mx-auto">
                  <FaUsers className="text-xs md:text-sm text-white" />
                </div>
                <h3 className="text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wide text-center mb-1">
                  Cotas
                </h3>
                <p className="text-sm md:text-base font-bold text-slate-800 text-center break-words">
                  {meta.cotasArrecadadas} / {meta.cotasTotal.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 md:p-5 border border-emerald-100/50 hover:shadow-md transition-all duration-300 flex flex-col justify-center">
                <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-2 mx-auto">
                  <FaDollarSign className="text-xs md:text-sm text-white" />
                </div>
                <h3 className="text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wide text-center mb-1">
                  Arrecadado
                </h3>
                <p className="text-sm md:text-base font-bold text-slate-800 text-center break-words">
                  {formatCurrency(meta.valorArrecadado)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 md:p-5 border border-emerald-100/50 hover:shadow-md transition-all duration-300 flex flex-col justify-center">
                <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-2 mx-auto">
                  <FaBullseye className="text-xs md:text-sm text-white" />
                </div>
                <h3 className="text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wide text-center mb-1">
                  Meta
                </h3>
                <p className="text-sm md:text-base font-bold text-slate-800 text-center break-words">
                  {formatCurrency(meta.metaValor)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 md:p-5 border border-emerald-100/50 hover:shadow-md transition-all duration-300 flex flex-col justify-center">
                <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-2 mx-auto">
                  <FaChartLine className="text-xs md:text-sm text-white" />
                </div>
                <h3 className="text-[10px] md:text-xs font-semibold text-slate-600 uppercase tracking-wide text-center mb-1">
                  Progresso
                </h3>
                <p className="text-sm md:text-base font-bold text-slate-800 text-center break-words">
                  {meta.porcentagemAlcancada.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Seção PIX Compacta */}
          <div className="flex-1 bg-gradient-to-b from-white via-white to-emerald-8 rounded-2xl lg:rounded-3xl shadow-lg p-6 lg:p-10 border border-white/40 w-full max-w-md hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col gap-6 items-center min-h-[280px]">
            <div className="text-center mb-3">
              <div className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-2 drop-shadow">
                <FaQrcode className="text-xs md:text-sm text-white" />
              </div>
              <h2 className="text-base font-bold text-slate-800 mb-1">
                PIX
              </h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mx-auto mb-2"></div>
              <p className="text-xs text-slate-600 leading-relaxed px-1">
                Contribua de forma rápida!
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 md:p-3 border border-green-200/50 mb-2">
                <div className="bg-white rounded-md p-2 border border-green-200/50 mb-2 shadow-sm">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2 text-center">
                    Email PIX
                  </p>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded p-1.5 border border-green-200/50 w-full overflow-hidden min-w-[200px] sm:min-w-[240px]">
                      <code className="text-[10px] md:text-xs font-mono text-green-700 block text-center break-all">
                        tesourariaipfarol@gmail.com
                      </code>
                    </div>
                    <button
                      onClick={() => setShowQRCode(true)}
                      className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      aria-label="Mostrar QR Code PIX"
                      tabIndex={0}
                    >
                      <FaQrcode className="text-xs" />
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-md p-2 border border-green-200/50 mb-2">
                    <p className="text-[10px] font-semibold text-slate-600 mb-1">Valor da Cota</p>
                    <p className="text-sm md:text-base font-bold text-green-700">{formatCurrency(200)}</p>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed px-1">
                    Após pagamento, entre em contato para confirmação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Compacto */}
        <div className="mt-auto pt-8 pb-4 border-t border-slate-200/50">
          <div className="text-center space-y-2">
            <p className="text-slate-500 text-xs font-medium">
              Atualizado: {new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-slate-400 text-xs">
              <span className="font-medium text-slate-600">Feito para a Glória de Deus</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>© 2024 IPF - Todos os direitos reservados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do QR Code */}
      {showQRCode && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4"
          tabIndex={-1}
          onClick={() => setShowQRCode(false)}
          onKeyDown={e => { if (e.key === 'Escape') setShowQRCode(false); }}
        >
          <div 
            className="relative bg-white/95 rounded-3xl p-6 md:p-10 max-w-lg w-full mx-auto shadow-xl border-2 border-emerald-200/70 animate-[fadeIn_0.2s_ease] transition-all duration-300"
            style={{ animation: 'fadeIn 0.2s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Botão de fechar */}
            <button
              onClick={() => setShowQRCode(false)}
              aria-label="Fechar modal"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <h3 className="text-2xl font-semibold tracking-wide text-emerald-700 mb-6 text-center">
              QR Code PIX
            </h3>
            <div className="flex flex-col items-center gap-4">
              <div className="hover:scale-105 transition-transform duration-200 cursor-pointer"
                onClick={() => setShowQRCode(false)}
              >
                <Image
                  src="/assets/QRCODE.jpg"
                  alt="QR Code PIX"
                  width={320}
                  height={320}
                  className="w-full h-auto max-w-[320px] mx-auto drop-shadow-lg"
                  priority
                />
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 w-full text-center">
                <p className="text-base font-semibold text-emerald-700 mb-1">Chave PIX (Email)</p>
                <CopyPixButton />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6 text-center">
              Clique no QR Code, no X ou fora desta área para fechar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const CopyPixButton = () => {
  const [copied, setCopied] = useState(false);
  const pixKey = "tesourariaipfarol@gmail.com";
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      className="font-mono text-emerald-800 text-lg bg-white rounded px-2 py-1 border border-emerald-200 hover:bg-emerald-50 transition relative outline-none focus:ring-2 focus:ring-emerald-400"
      aria-label="Copiar chave PIX"
      tabIndex={0}
    >
      {pixKey}
      {copied && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded shadow border border-emerald-200 animate-fade-in">
          Copiado!
        </span>
      )}
    </button>
  );
};
