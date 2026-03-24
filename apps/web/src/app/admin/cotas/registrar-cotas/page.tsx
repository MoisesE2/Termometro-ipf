"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api";
import { downloadExportExcelFromApi } from "@/lib/downloadExportExcelClient";
import {
  FaUser,
  FaLayerGroup,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileExcel,
  FaUpload,
  FaFileDownload,
  FaClipboardCheck,
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

type InvalidApiRow = { index: number; donorName: string; errors: string[] };

type ImportSummary = {
  created: number;
  failed: { index: number; donorName?: string; message: string }[];
  total: number;
  skippedRows: { rowNumber: number; reason: string }[];
  error?: string;
  /** Resultado do teste sem gravar */
  dryRun?: boolean;
  parsedOkCount?: number;
  wouldImportCount?: number;
  invalidApiRows?: InvalidApiRow[];
  overLimit?: boolean;
  readyToImport?: boolean;
};

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
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [excelBusyKind, setExcelBusyKind] = useState<"import" | "validate">("import");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelActionRef = useRef<"import" | "validate">("import");

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

  const handleDownloadFillModel = async () => {
    try {
      await downloadExportExcelFromApi({
        template: true,
        templateKind: "preenchimento",
        filename: "Modelo-Preenchimento-Cotas-IPF.xlsx",
      });
      showToast("success", "Modelo de preenchimento baixado.");
    } catch {
      showToast("error", "Não foi possível baixar o modelo.");
    }
  };

  const openExcelPicker = (action: "import" | "validate") => {
    excelActionRef.current = action;
    setExcelBusyKind(action);
    fileInputRef.current?.click();
  };

  const handleExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const action = excelActionRef.current;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setImporting(true);
    setImportSummary(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (action === "validate") {
        fd.append("dryRun", "1");
      }
      const res = await fetch("/api/admin/import-donations-excel", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as ImportSummary & {
        message?: string;
        dryRun?: boolean;
        parsedOkCount?: number;
        wouldImportCount?: number;
        invalidApiRows?: InvalidApiRow[];
        overLimit?: boolean;
        readyToImport?: boolean;
      };

      if (res.status === 401) {
        localStorage.removeItem("adminToken");
        router.push("/auth/login");
        return;
      }

      if (data.dryRun) {
        setImportSummary({
          created: 0,
          failed: [],
          total: data.parsedOkCount ?? 0,
          skippedRows: data.skippedRows ?? [],
          dryRun: true,
          parsedOkCount: data.parsedOkCount ?? 0,
          wouldImportCount: data.wouldImportCount ?? 0,
          invalidApiRows: data.invalidApiRows ?? [],
          overLimit: data.overLimit ?? false,
          readyToImport: data.readyToImport ?? false,
        });
        if (data.readyToImport) {
          showToast(
            "success",
            `Teste OK: ${data.wouldImportCount ?? 0} cota(s) pronta(s) para importar (nada foi gravado).`
          );
        } else if ((data.parsedOkCount ?? 0) === 0 && (data.skippedRows?.length ?? 0) === 0) {
          showToast("error", "Nenhuma linha de dados encontrada na planilha.");
        } else {
          showToast(
            "error",
            "A planilha precisa de ajustes antes de importar — veja o relatório abaixo."
          );
        }
        return;
      }

      if (!res.ok) {
        setImportSummary({
          created: data.created ?? 0,
          failed: data.failed ?? [],
          total: data.total ?? 0,
          skippedRows: data.skippedRows ?? [],
          error: data.error ?? data.message ?? "Importação falhou.",
        });
        showToast("error", data.error ?? data.message ?? "Erro na importação.");
        return;
      }

      setImportSummary({
        created: data.created ?? 0,
        failed: data.failed ?? [],
        total: data.total ?? 0,
        skippedRows: data.skippedRows ?? [],
      });
      const n = data.created ?? 0;
      showToast(
        "success",
        n === 1 ? "1 cota importada com sucesso." : `${n} cotas importadas com sucesso.`
      );
    } catch {
      showToast(
        "error",
        action === "validate"
          ? "Erro de rede ao testar a planilha."
          : "Erro de rede ao importar."
      );
    } finally {
      setImporting(false);
    }
  };

  const quotaCount = parseInt(form.quotaCount, 10);
  const previewAmount =
    form.autoCalc && !isNaN(quotaCount) && quotaCount > 0
      ? quotaCount * QUOTA_UNIT_VALUE
      : null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 max-w-2xl mx-auto space-y-6">
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

      {/* Importar Excel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <FaFileExcel className="w-5 h-5 text-[#1F5830]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Importar cotas por Excel</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Use a aba <strong className="text-gray-700">Plan1</strong> do modelo: colunas{" "}
              <strong>B</strong> participante, <strong>C</strong> quantidade de cotas,{" "}
              <strong>E</strong> valor pago e <strong>F</strong> data do pagamento.               Os dados
              começam na <strong>linha 5</strong>. No modelo de preenchimento, a primeira linha é um{" "}
              <strong>exemplo</strong> (nome com{" "}
              <code className="text-[11px] bg-gray-100 px-1 rounded">[EXEMPLO]</code>) — não entra na
              importação; substitua ou apague.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-4">
          <button
            type="button"
            onClick={handleDownloadFillModel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-[#1F5830] bg-green-50 border border-[#1F5830]/25 rounded-xl hover:bg-green-100/80 transition-all min-h-[44px]"
          >
            <FaFileDownload className="w-4 h-4" />
            Baixar modelo de preenchimento
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleExcelFile}
          />
          <button
            type="button"
            disabled={importing}
            onClick={() => openExcelPicker("validate")}
            title="Lê o Excel e mostra se há erros — não grava no sistema"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1F5830] bg-white border-2 border-[#1F5830]/35 rounded-xl hover:bg-green-50/80 transition-all disabled:opacity-60 min-h-[44px]"
          >
            {importing && excelBusyKind === "validate" ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1F5830] border-t-transparent rounded-full animate-spin" />
                Testando…
              </>
            ) : (
              <>
                <FaClipboardCheck className="w-4 h-4" />
                Testar planilha (sem gravar)
              </>
            )}
          </button>
          <button
            type="button"
            disabled={importing}
            onClick={() => openExcelPicker("import")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1F5830] hover:bg-[#163d22] rounded-xl transition-all disabled:opacity-60 min-h-[44px]"
          >
            {importing && excelBusyKind === "import" ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importando…
              </>
            ) : (
              <>
                <FaUpload className="w-4 h-4" />
                Importar para o sistema
              </>
            )}
          </button>
          <Link
            href="/admin/cotas/gerenciar-cotas"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 min-h-[44px]"
          >
            Ver cotas registradas
          </Link>
        </div>

        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          Limite: <strong>500 linhas</strong> por arquivo. O valor unitário da cota no sistema
          continua a ser <strong>R$ {QUOTA_UNIT_VALUE.toFixed(2)}</strong> (a coluna «Valor Cota»
          no Excel é só referência).
        </p>

        {importSummary && (
          <div
            className={`mt-4 rounded-xl border p-4 text-sm ${
              importSummary.dryRun
                ? importSummary.readyToImport
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : "bg-amber-50 border-amber-200 text-amber-950"
                : importSummary.error
                  ? "bg-red-50 border-red-100 text-red-900"
                  : "bg-green-50 border-green-100 text-green-900"
            }`}
          >
            {importSummary.dryRun ? (
              <>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <FaClipboardCheck className="w-4 h-4 flex-shrink-0" />
                  Simulação — nada foi gravado no banco
                </p>
                <ul className="mt-2 space-y-1 text-gray-800">
                  <li>
                    Linhas lidas com sucesso do Excel:{" "}
                    <strong>{importSummary.parsedOkCount ?? 0}</strong>
                  </li>
                  <li>
                    Linhas que <strong>passariam</strong> na validação da API:{" "}
                    <strong>{importSummary.wouldImportCount ?? 0}</strong>
                  </li>
                  {importSummary.overLimit && (
                    <li className="text-red-800 font-medium">
                      Acima do limite de 500 linhas — divida o arquivo antes de importar.
                    </li>
                  )}
                  {(importSummary.invalidApiRows?.length ?? 0) > 0 && (
                    <li className="text-red-800 font-medium">
                      {(importSummary.invalidApiRows?.length ?? 0)} linha(s) com problema de
                      regras (nome, cotas, valor ou data).
                    </li>
                  )}
                </ul>
                {importSummary.readyToImport && (
                  <p className="mt-2 text-emerald-900 font-medium">
                    Pode usar <strong>Importar para o sistema</strong> com o mesmo arquivo.
                  </p>
                )}
              </>
            ) : importSummary.error ? (
              <p className="font-medium">{importSummary.error}</p>
            ) : (
              <p className="font-medium">
                Gravadas: {importSummary.created} de {importSummary.total}
                {importSummary.failed.length > 0 &&
                  ` · Falhas ao gravar: ${importSummary.failed.length}`}
              </p>
            )}
            {(importSummary.invalidApiRows?.length ?? 0) > 0 && (
              <details className="mt-2 text-xs text-gray-800 open:mb-0">
                <summary className="cursor-pointer font-medium">
                  Detalhe: linhas que falhariam na API (
                  {importSummary.invalidApiRows?.length ?? 0})
                </summary>
                <ul className="mt-2 max-h-40 overflow-y-auto space-y-2 pl-1 list-none">
                  {importSummary.invalidApiRows?.slice(0, 40).map((row) => (
                    <li
                      key={row.index}
                      className="border-l-2 border-amber-400 pl-2 py-0.5"
                    >
                      <span className="font-medium">
                        Registro #{row.index + 1} — {row.donorName}
                      </span>
                      <ul className="list-disc pl-4 mt-0.5 text-gray-700">
                        {row.errors.map((er) => (
                          <li key={er}>{er}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                  {(importSummary.invalidApiRows?.length ?? 0) > 40 && (
                    <li>… e mais {(importSummary.invalidApiRows?.length ?? 0) - 40}</li>
                  )}
                </ul>
              </details>
            )}
            {importSummary.skippedRows.length > 0 && (
              <details className="mt-2 text-xs text-gray-700">
                <summary className="cursor-pointer font-medium text-gray-800">
                  Linhas ignoradas na leitura do Excel ({importSummary.skippedRows.length})
                </summary>
                <ul className="mt-2 max-h-40 overflow-y-auto space-y-1 pl-4 list-disc">
                  {importSummary.skippedRows.slice(0, 50).map((s, idx) => (
                    <li key={`${idx}-L${s.rowNumber}`}>
                      Linha {s.rowNumber}: {s.reason}
                    </li>
                  ))}
                  {importSummary.skippedRows.length > 50 && (
                    <li>… e mais {importSummary.skippedRows.length - 50}</li>
                  )}
                </ul>
              </details>
            )}
            {!importSummary.dryRun && importSummary.failed.length > 0 && (
              <details className="mt-2 text-xs text-gray-700">
                <summary className="cursor-pointer font-medium text-gray-800">
                  Erros ao gravar na base ({importSummary.failed.length})
                </summary>
                <ul className="mt-2 max-h-32 overflow-y-auto space-y-1 pl-4 list-disc">
                  {importSummary.failed.map((f) => (
                    <li key={f.index}>
                      #{f.index + 1} {f.donorName ? `(${f.donorName})` : ""}: {f.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
