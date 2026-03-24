"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaSync,
  FaLayerGroup,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaFileDownload,
} from "react-icons/fa";
import Link from "next/link";
import { downloadExportExcelFromApi } from "@/lib/downloadExportExcelClient";

const QUOTA_UNIT_VALUE = 200;

interface Donation {
  id: string;
  donorName: string;
  quotaCount: number;
  quotaUnitValue: number;
  amountPaid: number;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; name: string; email: string };
}

interface EditForm {
  donorName: string;
  quotaCount: string;
  amountPaid: string;
  paymentDate: string;
  autoCalc: boolean;
}

type ToastType = "success" | "error";

interface Toast {
  type: ToastType;
  message: string;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function GerenciarCotasPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const load = useCallback(
    async (silent = false) => {
      const token = getToken();
      if (!token) { router.push("/auth/login"); return; }

      if (!silent) setLoading(true);
      else setRefreshing(true);

      try {
        const res = await fetch(buildApiUrl("/donations"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) { router.push("/auth/login"); return; }
        if (res.ok) setDonations(await res.json());
      } catch {
        showToast("error", "Erro ao carregar dados.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => { load(); }, [load]);

  const openEdit = (d: Donation) => {
    setEditingId(d.id);
    setEditForm({
      donorName: d.donorName,
      quotaCount: String(d.quotaCount),
      amountPaid: String(d.amountPaid),
      paymentDate: d.paymentDate.split("T")[0],
      autoCalc: false,
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleEditQuotaChange = (value: string) => {
    const count = parseInt(value, 10);
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            quotaCount: value,
            amountPaid:
              prev.autoCalc && !isNaN(count) && count > 0
                ? String(count * QUOTA_UNIT_VALUE)
                : prev.amountPaid,
          }
        : null
    );
  };

  const handleSave = async () => {
    if (!editForm || !editingId) return;
    const token = getToken();
    if (!token) return;

    const quotaCount = parseInt(editForm.quotaCount, 10);
    const amountPaid = parseFloat(editForm.amountPaid);

    if (isNaN(quotaCount) || quotaCount <= 0 || isNaN(amountPaid) || amountPaid < 0) {
      showToast("error", "Dados inválidos. Verifique os campos.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(buildApiUrl(`/donations/${editingId}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          donorName: editForm.donorName.trim(),
          quotaCount,
          amountPaid,
          paymentDate: editForm.paymentDate,
        }),
      });

      if (!res.ok) {
        showToast("error", "Erro ao atualizar doação.");
        return;
      }

      const updated = await res.json();
      setDonations((prev) => prev.map((d) => (d.id === editingId ? updated : d)));
      closeEdit();
      showToast("success", "Doação atualizada com sucesso!");
    } catch {
      showToast("error", "Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;

    setDeletingId(id);
    try {
      const res = await fetch(buildApiUrl(`/donations/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDonations((prev) => prev.filter((d) => d.id !== id));
        showToast("success", "Doação removida com sucesso!");
      } else {
        showToast("error", "Erro ao remover doação.");
      }
    } catch {
      showToast("error", "Erro de conexão.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = donations.filter((d) =>
    d.donorName.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const rows = filtered.map((d) => ({
        donorName: d.donorName,
        quotaCount: d.quotaCount,
        quotaUnitValue: Number(d.quotaUnitValue),
        amountPaid: Number(d.amountPaid),
        paymentDate: d.paymentDate,
      }));
      const suffix = search.trim()
        ? `-filtro-${search.replace(/\s+/g, "-").slice(0, 24)}`
        : "";
      await downloadExportExcelFromApi({
        rows,
        filename: `Capitalizacao-Cotas-IPF${suffix}-${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
      showToast("success", "Arquivo Excel gerado com sucesso.");
    } catch {
      showToast("error", "Não foi possível gerar o Excel.");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadExportExcelFromApi({
        template: true,
        templateKind: "vazio",
        filename: "Modelo-Cotas-IPF.xlsx",
      });
      showToast("success", "Modelo vazio baixado (só layout e títulos).");
    } catch {
      showToast("error", "Não foi possível baixar o modelo.");
    }
  };

  const handleDownloadFillTemplate = async () => {
    try {
      await downloadExportExcelFromApi({
        template: true,
        templateKind: "preenchimento",
        filename: "Modelo-Preenchimento-Cotas-IPF.xlsx",
      });
      showToast("success", "Modelo de preenchimento baixado (linhas para lançar + aba Instruções).");
    } catch {
      showToast("error", "Não foi possível baixar o modelo de preenchimento.");
    }
  };

  const totalAmount = filtered.reduce((sum, d) => sum + Number(d.amountPaid), 0);
  const totalQuotas = filtered.reduce((sum, d) => sum + Number(d.quotaCount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3FA34D] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando cotas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed z-[70] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-xl text-sm font-medium animate-fadeIn
            left-4 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] top-auto sm:left-auto sm:right-6 sm:top-6 sm:bottom-auto max-w-md ml-auto sm:ml-0 ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          ) : (
            <FaExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && editForm && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 max-h-[90dvh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Editar Doação</h2>
              <button
                onClick={closeEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Doador</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={editForm.donorName}
                    onChange={(e) => setEditForm((p) => p ? { ...p, donorName: e.target.value } : null)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade de Cotas</label>
                <div className="relative">
                  <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={editForm.quotaCount}
                    onChange={(e) => handleEditQuotaChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-600">Valor Pago (R$)</label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.autoCalc}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const count = parseInt(editForm.quotaCount, 10);
                        setEditForm((p) =>
                          p
                            ? {
                                ...p,
                                autoCalc: checked,
                                amountPaid:
                                  checked && !isNaN(count) ? String(count * QUOTA_UNIT_VALUE) : p.amountPaid,
                              }
                            : null
                        );
                      }}
                      className="accent-[#3FA34D]"
                    />
                    Auto
                  </label>
                </div>
                <div className="relative">
                  <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={editForm.amountPaid}
                    onChange={(e) => setEditForm((p) => p ? { ...p, amountPaid: e.target.value, autoCalc: false } : null)}
                    readOnly={editForm.autoCalc}
                    className={`w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D] ${editForm.autoCalc ? "bg-green-50/60" : ""}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data do Pagamento</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                  <input
                    type="date"
                    max="2027-12-31"
                    value={editForm.paymentDate}
                    onChange={(e) => setEditForm((p) => p ? { ...p, paymentDate: e.target.value } : null)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEdit}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1F5830] hover:bg-[#163d22] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gerenciar Cotas</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            {donations.length} doação{donations.length !== 1 ? "ões" : ""} registrada{donations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:flex-wrap">
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 w-full sm:w-auto min-h-[44px] sm:min-h-0"
          >
            <FaSync className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting || filtered.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-[#1F5830] bg-white border border-[#1F5830]/30 rounded-xl hover:bg-green-50 transition-all disabled:opacity-50 w-full sm:w-auto min-h-[44px] sm:min-h-0"
            title="Exporta as doações visíveis (respeita a busca) no mesmo formato do Excel de capitalização"
          >
            <FaFileDownload className={`w-3.5 h-3.5 ${exporting ? "opacity-50" : ""}`} />
            {exporting ? "Gerando…" : "Exportar Excel"}
          </button>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all w-full sm:w-auto min-h-[44px] sm:min-h-0"
            title="Apenas cabeçalhos e título — sem linhas de dados"
          >
            <FaFileDownload className="w-3.5 h-3.5" />
            Modelo vazio
          </button>
          <button
            type="button"
            onClick={handleDownloadFillTemplate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-[#1F5830] bg-green-50/80 border border-[#1F5830]/25 rounded-xl hover:bg-green-50 transition-all w-full sm:w-auto min-h-[44px] sm:min-h-0"
            title="30 linhas formatadas para preencher + aba Instruções com orientações"
          >
            <FaFileDownload className="w-3.5 h-3.5" />
            Modelo de preenchimento
          </button>
          <Link
            href="/admin/cotas/registrar-cotas"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm text-white bg-[#1F5830] hover:bg-[#163d22] rounded-xl transition-all shadow-sm w-full sm:w-auto min-h-[44px] sm:min-h-0"
          >
            <FaPlus className="w-3.5 h-3.5" />
            Nova Cota
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaMoneyBillWave className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total (filtrado)</p>
              <p className="font-bold text-gray-800 text-sm">{formatBRL(totalAmount)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaLayerGroup className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Cotas (filtrado)</p>
              <p className="font-bold text-gray-800 text-sm">{totalQuotas} cotas</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="p-4 border-b border-gray-50">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome do doador..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile: lista em cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filtered.map((d) => (
            <div key={d.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-800 text-sm leading-snug flex-1 min-w-0">{d.donorName}</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 shrink-0">
                  {d.quotaCount}x
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="block text-gray-400">Valor</span>
                  <span className="font-medium text-gray-800">{formatBRL(Number(d.amountPaid))}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Data</span>
                  <span>{new Date(d.paymentDate).toLocaleDateString("pt-BR")}</span>
                </div>
                {d.createdBy?.name && (
                  <div className="col-span-2">
                    <span className="block text-gray-400">Registrado por</span>
                    <span>{d.createdBy.name}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openEdit(d)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-blue-600 bg-blue-50 active:bg-blue-100 rounded-xl min-h-[44px]"
                >
                  <FaEdit className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(d.id)}
                  disabled={deletingId === d.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-600 bg-red-50 active:bg-red-100 rounded-xl min-h-[44px] disabled:opacity-50"
                >
                  {deletingId === d.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaTrash className="w-3.5 h-3.5" />
                  )}
                  Remover
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="p-8 text-center text-gray-400 text-sm">
              {search
                ? `Nenhuma doação encontrada para "${search}"`
                : "Nenhuma doação registrada ainda."}
            </p>
          )}
        </div>

        {/* Desktop: tabela */}
        <div className="hidden md:block overflow-x-auto scroll-touch">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide bg-gray-50/50">
                <th className="px-6 py-3 font-medium">Doador</th>
                <th className="px-4 py-3 font-medium">Cotas</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Registrado por</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-800">{d.donorName}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                      {d.quotaCount}x
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-700 font-medium">
                    {formatBRL(Number(d.amountPaid))}
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {new Date(d.paymentDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-xs hidden md:table-cell">
                    {d.createdBy?.name ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(d)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                      >
                        <FaEdit className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={deletingId === d.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50"
                      >
                        {deletingId === d.id ? (
                          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTrash className="w-3 h-3" />
                        )}
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {search
                      ? `Nenhuma doação encontrada para "${search}"`
                      : "Nenhuma doação registrada ainda."}
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
