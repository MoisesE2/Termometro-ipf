'use client';

export const dynamic = 'force-dynamic'

import { Thermometer } from '@/components/ui/Thermometer';
import { FaUsers, FaDollarSign, FaQrcode } from 'react-icons/fa';
import { Meta } from '@/models/Meta';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedStage, setSelectedStage] = useState<'2025' | '2026' | '2027' | 'total'>('2025');
  const [navDirection, setNavDirection] = useState<'left' | 'right'>('right');

  // Constantes gerais
  const valorCota = 200;
  const valorArrecadado = 56500; // R$ 56.500,00 (valor atual) - 282,5 cotas
  const cotasArrecadadas = Math.ceil(valorArrecadado / valorCota);

  // Metas por etapa
  const etapas = {
    '2025': 400_000,
    '2026': 400_000,
    '2027': 400_000,
    'total': 1_200_000,
  } as const;

  const meta: Meta = useMemo(() => {
    const metaValor = etapas[selectedStage];
    const cotasTotal = metaValor / valorCota;
    
    let porcentagemAlcancada = 0;
    let valorParaEtapa = 0;
    let cotasParaEtapa = 0;
    
    if (selectedStage === 'total') {
      // Para o total, usa o valor total arrecadado
      porcentagemAlcancada = (valorArrecadado / metaValor) * 100;
      valorParaEtapa = valorArrecadado;
      cotasParaEtapa = cotasArrecadadas;
    } else {
      // Para etapas específicas, calcula baseado na sequência
      const meta2025 = etapas['2025'];
      const meta2026 = etapas['2026'];
      
      if (selectedStage === '2025') {
        // 2025: usa o valor arrecadado até o limite da meta 2025
        valorParaEtapa = Math.min(valorArrecadado, meta2025);
        porcentagemAlcancada = (valorParaEtapa / meta2025) * 100;
      } else if (selectedStage === '2026') {
        // 2026: só inicia após 2025 estar completo
        if (valorArrecadado > meta2025) {
          valorParaEtapa = Math.min(valorArrecadado - meta2025, meta2026);
          porcentagemAlcancada = (valorParaEtapa / meta2026) * 100;
        } else {
          valorParaEtapa = 0;
          porcentagemAlcancada = 0;
        }
      } else if (selectedStage === '2027') {
        // 2027: só inicia após 2025 e 2026 estarem completos
        const meta2025e2026 = meta2025 + meta2026;
        if (valorArrecadado > meta2025e2026) {
          valorParaEtapa = valorArrecadado - meta2025e2026;
          porcentagemAlcancada = (valorParaEtapa / etapas['2027']) * 100;
        } else {
          valorParaEtapa = 0;
          porcentagemAlcancada = 0;
        }
      }
      
      cotasParaEtapa = Math.ceil(valorParaEtapa / valorCota);
    }
    
    return {
      metaValor,
      cotasTotal,
      cotasArrecadadas: cotasParaEtapa,
      valorArrecadado: selectedStage === 'total' ? valorArrecadado : valorParaEtapa,
      porcentagemAlcancada,
      ultimaAtualizacao: new Date().toISOString(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStage, valorArrecadado]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Evitar mismatch de hidratação com data/hora
  const [nowStr, setNowStr] = useState('');
  useEffect(() => {
    try {
      const s = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());
      setNowStr(s);
    } catch {
      // noop
    }
  }, []);



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
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-wide bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2 lg:mb-3 leading-tight">
                Medidor de Arrecadação
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-teal-600 font-medium italic">
                &ldquo;Alargando Fronteiras&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Seletor de Etapas - Versão Discreta */}
        <div className="w-full max-w-lg mx-auto mb-6">
          <div className="flex items-center justify-center">
            {/* Card da etapa atual - mais sutil */}
            <div key={selectedStage} className={`px-4 py-2 rounded-lg border border-slate-100 bg-white/60 text-center ${navDirection === 'left' ? 'animate-slideInLeft' : 'animate-slideInRight'}`}>
              <div className="text-sm font-medium text-slate-600">
                {selectedStage === 'total' ? 'Meta Total' : `Meta ${selectedStage}`}
              </div>
            </div>
          </div>
          {/* Indicadores discretos das etapas */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {(['2025','2026','2027','total'] as const).map(key => (
              <button
                key={key}
                onClick={() => {
                  const order = ['2025','2026','2027','total'] as const;
                  const currentIndex = order.indexOf(selectedStage);
                  const nextIndex = order.indexOf(key);
                  setNavDirection(nextIndex >= currentIndex ? 'right' : 'left');
                  setSelectedStage(key);
                }}
                aria-label={`Selecionar ${key === 'total' ? 'Meta Total' : `Meta ${key}`}`}
                className={`h-2 w-2 rounded-full transition-all duration-200 ${selectedStage === key ? 'bg-emerald-500 w-4' : 'bg-slate-200 hover:bg-slate-300'}`}
              />
            ))}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-x-8 w-full items-center lg:items-stretch justify-center pb-3">
          {/* Termômetro */}
          <div className="flex-1 bg-gradient-to-b from-white via-white to-emerald-8 rounded-2xl lg:rounded-3xl shadow-lg p-3 lg:p-4 border border-white/40 w-full max-w-md hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col gap-3 items-center mx-auto">
            <div className="text-center mb-2 md:mb-2">
                              <h3 className="text-lg lg:text-xl font-bold tracking-wide text-slate-800 mb-1">Barra de Progresso</h3>
                              <p className="text-xl text-gray-700">
                                {selectedStage === 'total' ? 'Meta Total de arrecadação' : `Meta ${selectedStage} de arrecadação`}
                              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Thermometer percentage={meta.porcentagemAlcancada} animated={true} />
            </div>
            
            {/* Meta da etapa atual */}
            <div className="text-center mt-4 p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-100/50">
              <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Meta</h4>
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(meta.metaValor)}</p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="flex-[2.3] bg-gradient-to-b from-white via-white to-emerald-8 rounded-2xl lg:rounded-3xl shadow-lg p-3 lg:p-4 border border-white/40 w-full lg:max-w-2xl max-w-md hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col gap-3 items-center min-h-[180px] mx-auto">
            <div className="text-center mb-3">
                              <h2 className="text-lg md:text-xl lg:text-3xl font-bold tracking-wide text-slate-800 mb-1">
                  Estatísticas
                </h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mx-auto mb-2"></div>
                              <p className="text-xl text-slate-600 leading-relaxed px-1">
                  Cada cota de {formatCurrency(valorCota)} nos aproxima do objetivo!
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 md:p-5 border border-emerald-100/50 hover:shadow-md transition-all duration-300 flex flex-col justify-center">
                  <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-2 mx-auto">
                    <FaUsers className="text-xs md:text-sm text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-600 uppercase tracking-wide text-center mb-1">
                    Cotas
                  </h3>
                  <p className="text-lg md:text-xl font-bold text-slate-800 text-center break-words">
                    {meta.cotasArrecadadas} / {Math.floor(meta.cotasTotal).toLocaleString()}
                  </p>
              </div>

                                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 md:p-5 border border-emerald-100/50 hover:shadow-md transition-all duration-300 flex flex-col justify-center">
                  <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-2 mx-auto">
                    <FaDollarSign className="text-xs md:text-sm text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-600 uppercase tracking-wide text-center mb-1">
                    Arrecadado
                  </h3>
                  <p className="text-lg md:text-xl font-bold text-slate-800 text-center break-words">
                    {formatCurrency(meta.valorArrecadado)}
                  </p>
              </div>


            </div>
          </div>

          {/* Seção PIX Compacta */}
          <div className="flex-1 bg-gradient-to-b from-white via-white to-emerald-8 rounded-2xl lg:rounded-3xl shadow-lg p-3 lg:p-4 border border-white/40 w-full max-w-md hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col gap-3 items-center min-h-[160px] mx-auto">
            <div className="text-center mb-3">
              <div className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-2 drop-shadow">
                <FaQrcode className="text-xs md:text-sm text-white" />
              </div>
                              <h2 className="text-lg font-bold text-slate-800 mb-1">
                  PIX
                </h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mx-auto mb-2"></div>
                              <p className="text-2xl text-slate-600 leading-relaxed px-1">
                  Contribua de forma rápida!
                </p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 md:p-3 border border-green-200/50 mb-2">
                <div className="bg-white rounded-md p-2 border border-green-200/50 mb-2 shadow-sm">
                                     <p className="text-lg font-semibold text-slate-500 uppercase tracking-wide mb-2 text-center">
                     Email PIX
                   </p>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded p-1.5 border border-green-200/50 w-full overflow-hidden min-w-[200px] sm:min-w-[240px]">
                                             <code className="text-lg md:text-xl font-mono font-bold text-green-700 block text-center whitespace-nowrap overflow-hidden">
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
                                           <p className="text-lg font-semibold text-slate-600 mb-1">Valor da Cota</p>
                                           <p className="text-lg md:text-xl font-bold text-green-700">{formatCurrency(valorCota)}</p>
                  </div>
                                     <p className="text-lg text-slate-600 leading-relaxed px-1">
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
            <p className="text-slate-500 text-base font-medium">
              Atualizado: <span suppressHydrationWarning>{nowStr || ''}</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-slate-400 text-base">
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
          className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4 animate-fadeIn"
          tabIndex={-1}
          onClick={() => setShowQRCode(false)}
          onKeyDown={e => { if (e.key === 'Escape') setShowQRCode(false); }}
        >
                     <div 
             className="relative bg-white/95 rounded-3xl p-6 md:p-10 max-w-2xl w-full mx-auto shadow-xl border-2 border-emerald-200/70 animate-scaleIn transition-all duration-300"
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
                         <h3 className="text-3xl font-semibold tracking-wide text-emerald-700 mb-8 text-center">
               QR Code PIX
             </h3>
                         <div className="flex flex-col items-center gap-4 w-full">
               <div className="hover:scale-105 transition-transform duration-200 cursor-pointer w-full flex justify-center"
                  onClick={() => setShowQRCode(false)}
                >
                  <Image
                    src="/assets/QRCODE.jpg"
                    alt="QR Code PIX"
                    width={500}
                    height={500}
                    className="w-full h-auto max-w-[500px] max-h-[70vh] mx-auto drop-shadow-lg object-contain"
                    priority
                  />
                </div>
                             <div className="bg-emerald-50 rounded-xl p-8 border border-emerald-100 w-full text-center">
                 <p className="text-2xl font-semibold text-emerald-700 mb-4">Chave PIX (Email)</p>
                 <CopyPixButton />
               </div>
            </div>
                         <p className="text-lg text-gray-500 mt-8 text-center">
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
             className="font-mono font-bold text-emerald-800 text-3xl bg-white rounded px-4 py-3 border border-emerald-200 hover:bg-emerald-50 transition relative outline-none focus:ring-2 focus:ring-emerald-400 whitespace-nowrap overflow-hidden"
      aria-label="Copiar chave PIX"
      tabIndex={0}
    >
      {pixKey}
      {copied && (
                 <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-700 text-base font-semibold px-2 py-0.5 rounded shadow border border-emerald-200 animate-fadeIn">
          Copiado!
        </span>
      )}
    </button>
  );
};
