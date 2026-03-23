"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchJson } from "@/lib/api";
import {
  FaMoneyBillWave,
  FaLayerGroup,
  FaChartLine,
  FaFlag,
  FaSync,
  FaClock,
} from "react-icons/fa";

const META_TOTAL = 1_200_000;
const QUOTA_VALUE = 200;

interface StatsData {
  totalReceived: number;
  totalQuotas: number;
  quotaUnitValue: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  iconBg: string;
  iconColor: string;
}

function StatCard({ icon, label, value, sub, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 flex items-start gap-3 sm:gap-4 hover:shadow-md transition-shadow min-w-0">
      <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-snug">{label}</p>
        <p className="text-lg sm:text-2xl font-bold text-gray-800 mt-0.5 break-words">{value}</p>
        {sub && <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 line-clamp-2">{sub}</p>}
      </div>
    </div>
  );
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function GestaoMetaPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetchJson("/stats/summary");
      if (!res.ok) throw new Error("Falha ao carregar dados.");
      const json = (await res.json()) as {
        totalReceived?: number;
        totalQuotas?: number;
        quotaUnitValue?: number;
      };
      setData({
        totalReceived: Number(json.totalReceived ?? 0),
        totalQuotas: Number(json.totalQuotas ?? 0),
        quotaUnitValue: Number(json.quotaUnitValue ?? QUOTA_VALUE),
      });
      setLastUpdated(new Date());
    } catch {
      setError("Não foi possível carregar os dados. Tente novamente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalReceived = data?.totalReceived ?? 0;
  const totalQuotas = data?.totalQuotas ?? 0;
  const percentage = Math.min((totalReceived / META_TOTAL) * 100, 100);
  const remaining = Math.max(META_TOTAL - totalReceived, 0);
  const remainingQuotas = Math.max(Math.ceil(remaining / QUOTA_VALUE), 0);
  const totalQuotaSlots = META_TOTAL / QUOTA_VALUE;

  // Stage breakdown (matching home page logic)
  const stages = [
    { year: "2025", meta: 400_000 },
    { year: "2026", meta: 400_000 },
    { year: "2027", meta: 400_000 },
  ];

  const stageProgress = stages.map(({ year, meta }, i) => {
    const prevMeta = stages.slice(0, i).reduce((s, st) => s + st.meta, 0);
    const valueForStage = Math.max(Math.min(totalReceived - prevMeta, meta), 0);
    const pct = (valueForStage / meta) * 100;
    return { year, meta, valueForStage, pct: Math.min(pct, 100) };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3FA34D] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando dados da meta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pb-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-4">
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => load()}
            className="px-5 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-all"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestão de Meta</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Acompanhe o progresso rumo à meta de {formatBRL(META_TOTAL)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
          {lastUpdated && (
            <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400 justify-center sm:justify-end">
              <FaClock className="w-3 h-3 shrink-0" />
              {lastUpdated.toLocaleTimeString("pt-BR")}
            </span>
          )}
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 min-h-[44px] sm:min-h-0 w-full sm:w-auto"
          >
            <FaSync className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<FaMoneyBillWave className="w-5 h-5" />}
          label="Total Arrecadado"
          value={formatBRL(totalReceived)}
          sub={`de ${formatBRL(META_TOTAL)}`}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          icon={<FaLayerGroup className="w-5 h-5" />}
          label="Cotas Registradas"
          value={String(totalQuotas)}
          sub={`de ${totalQuotaSlots.toLocaleString("pt-BR")} cotas`}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<FaChartLine className="w-5 h-5" />}
          label="Meta Atingida"
          value={`${percentage.toFixed(1)}%`}
          sub="do objetivo total"
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={<FaFlag className="w-5 h-5" />}
          label="Restante"
          value={formatBRL(remaining)}
          sub={`${remainingQuotas.toLocaleString("pt-BR")} cotas restantes`}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Main progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">Progresso Geral</h2>
          <span className="text-xl sm:text-2xl font-bold text-[#1F5830] shrink-0">
            {percentage.toFixed(1)}%
          </span>
        </div>

        <div className="relative w-full h-7 sm:h-6 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1F5830] to-[#3FA34D] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
          {percentage > 8 && (
            <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-white text-[10px] sm:text-xs font-semibold truncate max-w-[70%]">
              {formatBRL(totalReceived)}
            </span>
          )}
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>R$ 0</span>
          <span>{formatBRL(META_TOTAL)}</span>
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-5 sm:mb-6">Progresso por Etapa</h2>

        <div className="space-y-5 sm:space-y-6">
          {stageProgress.map(({ year, meta, valueForStage, pct }) => (
            <div key={year}>
              <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1F5830]/10 text-[#1F5830] text-xs font-bold shrink-0">
                    {year.slice(2)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Etapa {year}</p>
                    <p className="text-[11px] sm:text-xs text-gray-400">Meta: {formatBRL(meta)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-800">
                    {formatBRL(valueForStage)}
                  </p>
                  <p className="text-[11px] text-gray-400">{pct.toFixed(1)}%</p>
                </div>
              </div>

              <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    pct >= 100
                      ? "bg-gradient-to-r from-emerald-500 to-green-400"
                      : "bg-gradient-to-r from-[#1F5830] to-[#3FA34D]"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {pct >= 100 && (
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  ✓ Etapa concluída!
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats detail table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-4 sm:mb-5">Detalhamento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { label: "Valor da cota", value: formatBRL(QUOTA_VALUE) },
            { label: "Total de vagas", value: `${totalQuotaSlots.toLocaleString("pt-BR")} cotas` },
            { label: "Vagas preenchidas", value: `${totalQuotas.toLocaleString("pt-BR")} cotas` },
            { label: "Vagas restantes", value: `${remainingQuotas.toLocaleString("pt-BR")} cotas` },
            { label: "Valor arrecadado", value: formatBRL(totalReceived) },
            { label: "Valor restante", value: formatBRL(remaining) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl"
            >
              <span className="text-xs sm:text-sm text-gray-500">{label}</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 text-left sm:text-right break-words">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
