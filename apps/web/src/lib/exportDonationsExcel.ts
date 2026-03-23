import * as XLSX from "xlsx";

/** Linha compatível com o modelo "Capitalização Cotas compra Imóvel IPF.xlsx" (Plan1). */
export type DonationExcelRow = {
  donorName: string;
  quotaCount: number;
  quotaUnitValue: number;
  amountPaid: number;
  paymentDate: string;
};

/**
 * Converte data (YYYY-MM-DD da API) para número serial do Excel,
 * igual ao formato do arquivo de exemplo (ex.: 45849).
 */
export function paymentDateToExcelSerial(paymentDate: string): number {
  const part = paymentDate.split("T")[0] ?? "";
  const [y, m, d] = part.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const utc = Date.UTC(y, m - 1, d);
  const excelEpoch = Date.UTC(1899, 11, 30);
  return Math.round((utc - excelEpoch) / 86400000);
}

/**
 * Monta a planilha no mesmo layout do exemplo:
 * linha 1 título, linha 3 cabeçalhos, dados a partir da linha 5.
 */
export function buildDonationsWorkbook(rows: DonationExcelRow[]): XLSX.WorkBook {
  const title = ["", "CAMPANHA CAPITALIZAÇÃO COMPRA IMÓVEL", "", "", "", "", ""];
  const blank = ["", "", "", "", "", "", ""];
  const headers = [
    "",
    "PARTICIPANTES",
    "Quant. COTAS",
    "Valor Cota",
    "Valor Pago",
    "Data Pagamento",
    "SOMA DIÁRIA",
  ];

  const sorted = [...rows].sort((a, b) => {
    const da = a.paymentDate.localeCompare(b.paymentDate);
    if (da !== 0) return da;
    return a.donorName.localeCompare(b.donorName, "pt-BR");
  });

  const dataRows = sorted.map((r, i) => [
    i + 1,
    r.donorName,
    r.quotaCount,
    Number(r.quotaUnitValue),
    Number(r.amountPaid),
    paymentDateToExcelSerial(r.paymentDate),
    "",
  ]);

  const aoa: (string | number)[][] = [title, blank, headers, blank, ...dataRows];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plan1");
  return wb;
}

/** Gera apenas o modelo (título + cabeçalhos, sem linhas de dados). */
export function buildEmptyTemplateWorkbook(): XLSX.WorkBook {
  return buildDonationsWorkbook([]);
}

export function downloadDonationsExcel(rows: DonationExcelRow[], filename?: string): void {
  const wb = buildDonationsWorkbook(rows);
  const name =
    filename ??
    `Capitalizacao-Cotas-IPF-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}

export function downloadEmptyTemplateExcel(filename = "Modelo-Cotas-IPF.xlsx"): void {
  const wb = buildEmptyTemplateWorkbook();
  XLSX.writeFile(wb, filename);
}
