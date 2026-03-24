/**
 * Chama a API de exportação (exceljs só no servidor) e dispara o download no navegador.
 */
export async function downloadExportExcelFromApi(payload: {
  template?: boolean;
  /** Com `template: true`: `vazio` = só cabeçalhos; `preenchimento` = linhas em branco + aba Instruções. */
  templateKind?: "vazio" | "preenchimento";
  rows?: Array<{
    donorName: string;
    quotaCount: number;
    quotaUnitValue: number;
    amountPaid: number;
    paymentDate: string;
  }>;
  filename?: string;
}): Promise<void> {
  const res = await fetch("/api/admin/export-excel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err === "object" && err && "error" in err
        ? String((err as { error: string }).error)
        : "Falha na exportação"
    );
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename = payload.filename ?? "export.xlsx";
  const match = cd?.match(/filename="([^"]+)"/);
  if (match?.[1]) filename = match[1];

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}
