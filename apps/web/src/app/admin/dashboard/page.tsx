"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaUsers,
  FaFlag,
  FaPlus,
  FaSync,
} from "react-icons/fa";
import { buildApiUrl } from "@/lib/api";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const META_TOTAL = 1_200_000;
const QUOTA_VALUE = 200;

interface Donation {
  id: string;
  donorName: string;
  quotaCount: number;
  quotaUnitValue: number;
  amountPaid: number;
  paymentDate: string;
  createdAt: string;
  createdBy?: { name: string };
}

interface Stats {
  totalQuotas: number;
  totalReceived: number;
  quotaUnitValue: number;
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function KpiCard({ title, value, subtitle, icon, color, bgColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex items-start gap-3 sm:gap-4 hover:shadow-md transition-shadow min-w-0">
      <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${bgColor}`}>
        <span className={color}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-snug">{title}</p>
        <p className="text-lg sm:text-2xl font-bold text-gray-800 mt-0.5 break-words">{value}</p>
        {subtitle && <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 line-clamp-2">{subtitle}</p>}
      </div>
    </div>
  );
}

const YEAR_FILTERS = ["2024", "2025", "2026", "2027", "Todos"] as const;
type YearFilter = (typeof YEAR_FILTERS)[number];

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function buildMonthlyData(donations: Donation[], yearFilter: YearFilter) {
  const map: Record<string, { mes: string; arrecadado: number; cotas: number }> = {};

  const yearsToShow =
    yearFilter === "Todos" ? ["2024", "2025", "2026", "2027"] : [yearFilter];

  yearsToShow.forEach((year) => {
    MONTHS.forEach((mes, i) => {
      const key = `${year}-${String(i + 1).padStart(2, "0")}`;
      map[key] = { mes: yearFilter === "Todos" ? `${mes}/${year.slice(2)}` : mes, arrecadado: 0, cotas: 0 };
    });
  });

  donations.forEach((d) => {
    const date = new Date(d.paymentDate);
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;
    if (map[key]) {
      map[key].arrecadado += Number(d.amountPaid);
      map[key].cotas += Number(d.quotaCount);
    }
  });

  return Object.values(map);
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name === "arrecadado"
            ? `Arrecadado: ${formatBRL(p.value)}`
            : `Cotas: ${p.value}`}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const [stats, setStats] = useState<Stats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<YearFilter>("2025");
  const [refreshing, setRefreshing] = useState(false);
  // Guard de mount: gráficos só são renderizados no cliente após hidratação completa
  // Evita mismatch SSR/CSR que gera React error #418 com recharts + ResponsiveContainer
  const [isMounted, setIsMounted] = useState(false);

  const barChartHeight = isNarrow ? 220 : 280;
  const lineChartHeight = isNarrow ? 190 : 220;
  const radialSize = isNarrow ? 180 : 200;

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      if (!token) { router.push("/auth/login"); return; }

      try {
        const [statsRes, donationsRes] = await Promise.all([
          fetch(buildApiUrl("/stats/summary")),
          fetch(buildApiUrl("/donations"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (donationsRes.ok) setDonations(await donationsRes.json());
      } catch {
        // silently fail — data stays as is
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, [loadData]);

  const totalReceived = stats?.totalReceived ?? 0;
  const totalQuotas = stats?.totalQuotas ?? 0;
  const percentage = Math.min((totalReceived / META_TOTAL) * 100, 100);
  const remaining = Math.max(META_TOTAL - totalReceived, 0);
  const remainingQuotas = Math.max(Math.ceil(remaining / QUOTA_VALUE), 0);

  const monthlyData = buildMonthlyData(donations, yearFilter);

  const radialData = [
    { name: "Alcançado", value: percentage, fill: "#3FA34D" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3FA34D] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 space-y-5 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Acompanhe em tempo real o progresso da meta
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 w-full sm:w-auto min-h-[44px] sm:min-h-0"
          >
            <FaSync className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <Link
            href="/admin/cotas/registrar-cotas"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-white bg-[#1F5830] hover:bg-[#163d22] rounded-xl transition-all shadow-sm w-full sm:w-auto min-h-[44px] sm:min-h-0"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Registrar Cota
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Arrecadado"
          value={formatBRL(totalReceived)}
          subtitle={`de ${formatBRL(META_TOTAL)}`}
          icon={<FaMoneyBillWave className="w-5 h-5" />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KpiCard
          title="Cotas Registradas"
          value={String(totalQuotas)}
          subtitle={`de ${(META_TOTAL / QUOTA_VALUE).toLocaleString("pt-BR")} cotas`}
          icon={<FaUsers className="w-5 h-5" />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KpiCard
          title="Meta Atingida"
          value={`${percentage.toFixed(1)}%`}
          subtitle="do total de R$ 1.200.000"
          icon={<FaChartLine className="w-5 h-5" />}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <KpiCard
          title="Cotas Restantes"
          value={remainingQuotas.toLocaleString("pt-BR")}
          subtitle={`${formatBRL(remaining)} restantes`}
          icon={<FaFlag className="w-5 h-5" />}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Bar Chart - Monthly */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 min-w-0">
          <div className="flex flex-col gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-gray-800">Arrecadação por Mês</h2>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Valor arrecadado em cada mês</p>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar scroll-touch flex-nowrap w-full">
              {YEAR_FILTERS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYearFilter(y)}
                  className={`flex-shrink-0 px-3 py-2 sm:py-1.5 text-xs font-medium rounded-lg transition-all min-h-[40px] sm:min-h-0 ${
                    yearFilter === y
                      ? "bg-white text-[#1F5830] shadow-sm font-semibold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full min-h-0 -mx-1 sm:mx-0">
            {isMounted ? (
              <ResponsiveContainer width="100%" height={barChartHeight}>
                <BarChart data={monthlyData} barSize={yearFilter === "Todos" ? (isNarrow ? 3 : 4) : isNarrow ? 14 : 20} margin={{ left: isNarrow ? 4 : 8, right: 8, bottom: isNarrow && yearFilter === "Todos" ? 28 : 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{
                      fontSize: isNarrow ? 9 : 11,
                      fill: "#9ca3af",
                      ...(isNarrow && yearFilter === "Todos"
                        ? { angle: -45, textAnchor: "end", height: 48 }
                        : {}),
                    }}
                    axisLine={false}
                    tickLine={false}
                    interval={isNarrow && yearFilter !== "Todos" ? "preserveStartEnd" : 0}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                    }
                    tick={{ fontSize: isNarrow ? 10 : 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={isNarrow ? 48 : 55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="arrecadado" fill="#3FA34D" radius={[6, 6, 0, 0]} name="arrecadado" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: barChartHeight }} className="animate-pulse bg-gray-50 rounded-xl" />
            )}
          </div>
        </div>

        {/* Radial progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col items-center justify-center min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 self-start w-full">
            Progresso da Meta
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-400 mb-4 sm:mb-6 self-start">Meta total: {formatBRL(META_TOTAL)}</p>

          <div className="relative w-full max-w-[200px] mx-auto">
            {isMounted ? (
              <ResponsiveContainer width="100%" height={radialSize}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius={isNarrow ? 58 : 65}
                  outerRadius={isNarrow ? 80 : 90}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" background={{ fill: "#f0fdf4" }} cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: radialSize }} className="animate-pulse bg-gray-50 rounded-full" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-bold text-[#1F5830]">{percentage.toFixed(1)}%</span>
              <span className="text-[11px] sm:text-xs text-gray-400 mt-1">da meta</span>
            </div>
          </div>

          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Arrecadado</span>
              <span className="font-semibold text-gray-800">{formatBRL(totalReceived)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Restante</span>
              <span className="font-semibold text-gray-800">{formatBRL(remaining)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cotas line chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 min-w-0">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">Cotas por Mês</h2>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
            Quantidade de cotas registradas — filtrando por: {yearFilter}
          </p>
        </div>
        <div className="w-full min-h-0 -mx-1 sm:mx-0">
          {isMounted ? (
            <ResponsiveContainer width="100%" height={lineChartHeight}>
              <LineChart data={monthlyData} margin={{ left: isNarrow ? 0 : 4, right: 8, bottom: isNarrow && yearFilter === "Todos" ? 24 : 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{
                    fontSize: isNarrow ? 9 : 11,
                    fill: "#9ca3af",
                    ...(isNarrow && yearFilter === "Todos"
                      ? { angle: -45, textAnchor: "end", height: 44 }
                      : {}),
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: isNarrow ? 10 : 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  width={isNarrow ? 28 : 35}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={() => "Cotas registradas"}
                  wrapperStyle={{ fontSize: isNarrow ? 11 : 12, paddingTop: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="cotas"
                  stroke="#1F5830"
                  strokeWidth={isNarrow ? 2 : 2.5}
                  dot={{ fill: "#1F5830", strokeWidth: 0, r: isNarrow ? 3 : 4 }}
                  activeDot={{ r: isNarrow ? 5 : 6 }}
                  name="cotas"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: lineChartHeight }} className="animate-pulse bg-gray-50 rounded-xl" />
          )}
        </div>
      </div>

      {/* Recent donations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-5">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">Últimas Doações</h2>
          <Link
            href="/admin/cotas/gerenciar-cotas"
            className="text-xs text-[#3FA34D] hover:text-[#1F5830] font-medium shrink-0"
          >
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto scroll-touch -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-xs sm:text-sm min-w-[320px]">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="pb-3 font-medium">Doador</th>
                <th className="pb-3 font-medium">Cotas</th>
                <th className="pb-3 font-medium">Valor</th>
                <th className="pb-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {donations.slice(0, 8).map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 font-medium text-gray-800">{d.donorName}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      {d.quotaCount}x
                    </span>
                  </td>
                  <td className="py-3 text-gray-700">{formatBRL(Number(d.amountPaid))}</td>
                  <td className="py-3 text-gray-400">
                    {new Date(d.paymentDate).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {donations.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Nenhuma doação registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
