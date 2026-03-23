"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api";
import {
  FaUser,
  FaLayerGroup,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import Link from "next/link";

const QUOTA_UNIT_VALUE = 200;

interface FormState {
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

export default function RegistrarCotaPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    donorName: "",
    quotaCount: "",
    amountPaid: "",
    paymentDate: new Date().toISOString().split("T")[0],
    autoCalc: true,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleQuotaCountChange = (value: string) => {
    const count = parseInt(value, 10);
    setForm((prev) => ({
      ...prev,
      quotaCount: value,
      amountPaid: prev.autoCalc && !isNaN(count) && count > 0
        ? String(count * QUOTA_UNIT_VALUE)
        : prev.amountPaid,
    }));
  };

  const handleAmountChange = (value: string) => {
    setForm((prev) => ({ ...prev, amountPaid: value, autoCalc: false }));
  };

  const handleAutoCalcToggle = (checked: boolean) => {
    const count = parseInt(form.quotaCount, 10);
    setForm((prev) => ({
      ...prev,
      autoCalc: checked,
      amountPaid: checked && !isNaN(count) && count > 0
        ? String(count * QUOTA_UNIT_VALUE)
        : prev.amountPaid,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

    if (!token) {
      router.push("/auth/login");
      return;
    }

    const quotaCount = parseInt(form.quotaCount, 10);
    const amountPaid = parseFloat(form.amountPaid);

    if (isNaN(quotaCount) || quotaCount <= 0) {
      showToast("error", "Quantidade de cotas inválida.");
      setLoading(false);
      return;
    }

    if (isNaN(amountPaid) || amountPaid < 0) {
      showToast("error", "Valor pago inválido.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/donations"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          donorName: form.donorName.trim(),
          quotaCount,
          amountPaid,
          paymentDate: form.paymentDate,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.message || "Erro ao registrar cota.");
        return;
      }

      showToast("success", "Cota registrada com sucesso!");
      setForm({
        donorName: "",
        quotaCount: "",
        amountPaid: "",
        paymentDate: new Date().toISOString().split("T")[0],
        autoCalc: true,
      });

      setTimeout(() => router.push("/admin/cotas/gerenciar-cotas"), 1500);
    } catch {
      showToast("error", "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const quotaCount = parseInt(form.quotaCount, 10);
  const previewAmount =
    form.autoCalc && !isNaN(quotaCount) && quotaCount > 0
      ? quotaCount * QUOTA_UNIT_VALUE
      : null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 max-w-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed z-[70] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-xl text-sm font-medium transition-all animate-fadeIn
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

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400 mb-3">
          <Link href="/admin/dashboard" className="hover:text-[#1F5830] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-600">Registrar Cota</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Registrar Nova Cota</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Preencha os dados da doação para registrá-la no sistema
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome do Doador *
            </label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                value={form.donorName}
                onChange={(e) => setForm((p) => ({ ...p, donorName: e.target.value }))}
                placeholder="Nome completo do doador"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Quota Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Quantidade de Cotas *
            </label>
            <div className="relative">
              <FaLayerGroup className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                required
                min={1}
                step={1}
                value={form.quotaCount}
                onChange={(e) => handleQuotaCountChange(e.target.value)}
                placeholder="Ex: 3"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Cada cota equivale a{" "}
              <span className="font-medium text-[#3FA34D]">
                R$ {QUOTA_UNIT_VALUE.toLocaleString("pt-BR")}
              </span>
            </p>
          </div>

          {/* Amount Paid */}
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Valor Pago (R$) *
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none min-h-[44px] sm:min-h-0">
                <input
                  type="checkbox"
                  checked={form.autoCalc}
                  onChange={(e) => handleAutoCalcToggle(e.target.checked)}
                  className="accent-[#3FA34D] w-4 h-4 sm:w-3.5 sm:h-3.5"
                />
                Calcular automaticamente
              </label>
            </div>
            <div className="relative">
              <FaMoneyBillWave className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                required
                min={0}
                step={0.01}
                value={form.amountPaid}
                onChange={(e) => handleAmountChange(e.target.value)}
                readOnly={form.autoCalc}
                placeholder="0,00"
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:border-transparent transition-all ${
                  form.autoCalc
                    ? "bg-green-50/60 text-gray-600 cursor-default"
                    : "bg-gray-50 focus:bg-white"
                }`}
              />
            </div>
            {previewAmount !== null && (
              <p className="text-xs text-green-600 mt-1.5 font-medium">
                = R$ {previewAmount.toLocaleString("pt-BR")} ({quotaCount} × R$ {QUOTA_UNIT_VALUE})
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Data do Pagamento *
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                required
                max="2027-12-31"
                value={form.paymentDate}
                onChange={(e) => setForm((p) => ({ ...p, paymentDate: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA34D] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Summary box */}
          {form.donorName && form.quotaCount && form.amountPaid && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 text-sm">
              <p className="font-semibold text-[#1F5830] mb-2">Resumo do Registro</p>
              <div className="space-y-1 text-gray-700">
                <p>
                  <span className="text-gray-500">Doador:</span>{" "}
                  <span className="font-medium">{form.donorName}</span>
                </p>
                <p>
                  <span className="text-gray-500">Cotas:</span>{" "}
                  <span className="font-medium">{form.quotaCount}</span>
                </p>
                <p>
                  <span className="text-gray-500">Valor:</span>{" "}
                  <span className="font-medium text-green-700">
                    R${" "}
                    {parseFloat(form.amountPaid || "0").toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Data:</span>{" "}
                  <span className="font-medium">
                    {form.paymentDate
                      ? new Date(form.paymentDate + "T12:00:00").toLocaleDateString("pt-BR")
                      : "-"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all min-h-[48px] sm:min-h-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-[#1F5830] hover:bg-[#163d22] text-white font-semibold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px] sm:min-h-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Cota"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
