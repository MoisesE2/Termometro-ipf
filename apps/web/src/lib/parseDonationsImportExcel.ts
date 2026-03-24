import type { Cell } from "exceljs";
import { IMPORT_SKIP_DONOR_NAME_PREFIX } from "@/lib/excelImportConstants";

export type ParsedDonationForApi = {
  donorName: string;
  quotaCount: number;
  amountPaid: number;
  paymentDate: string;
};

export type ExcelImportParseResult = {
  donations: ParsedDonationForApi[];
  skippedRows: { rowNumber: number; reason: string }[];
};

function cellText(cell: Cell | undefined): string {
  if (!cell || cell.value === null || cell.value === undefined) return "";
  const v = cell.value;
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object" && "richText" in v && Array.isArray(v.richText)) {
    return v.richText.map((t: { text?: string }) => t.text ?? "").join("").trim();
  }
  if (typeof v === "object" && "text" in v && typeof (v as { text: string }).text === "string") {
    return (v as { text: string }).text.trim();
  }
  return String(v).trim();
}

function parseNumberLoose(raw: string): number | null {
  if (!raw) return null;
  const n = Number(
    raw.replace(/\s/g, "").replace(/R\$\s?/gi, "").replace(/\./g, "").replace(",", ".")
  );
  return Number.isFinite(n) ? n : null;
}

function cellNumber(cell: Cell | undefined): number | null {
  if (!cell || cell.value === null || cell.value === undefined) return null;
  const v = cell.value;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return parseNumberLoose(cellText(cell));
}

function parsePaymentDate(cell: Cell | undefined): string | null {
  if (!cell || cell.value === null || cell.value === undefined) return null;
  const v = cell.value;
  if (v instanceof Date && !isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    const serial = Math.round(v);
    if (serial <= 0) return null;
    const excelEpoch = Date.UTC(1899, 11, 30);
    const d = new Date(excelEpoch + serial * 86400000);
    return d.toISOString().slice(0, 10);
  }
  const s = cellText(cell);
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) {
    const dd = parseInt(br[1], 10);
    const mm = parseInt(br[2], 10);
    const yyyy = parseInt(br[3], 10);
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

/**
 * Lê Plan1 (ou primeira aba) no layout do modelo IPF: dados a partir da linha 5.
 * Colunas: B nome, C cotas, D valor cota (ignorado na API), E valor pago, F data.
 *
 * exceljs é carregado só em runtime (import dinâmico) para o Webpack não gerar
 * chunks assíncronos instáveis no dev (ex.: `Cannot find module './undefined'`).
 */
export async function parseDonationsImportExcelBuffer(
  data: ArrayBuffer
): Promise<ExcelImportParseResult> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(data);
  const ws = wb.getWorksheet("Plan1") ?? wb.worksheets[0];
  if (!ws) {
    return {
      donations: [],
      skippedRows: [{ rowNumber: 0, reason: "Nenhuma aba encontrada na planilha." }],
    };
  }

  const donations: ParsedDonationForApi[] = [];
  const skippedRows: { rowNumber: number; reason: string }[] = [];
  const lastRow = ws.lastRow?.number ?? 0;
  const maxRow = Math.min(lastRow, 5000);

  for (let r = 5; r <= maxRow; r++) {
    const row = ws.getRow(r);
    const donorName = cellText(row.getCell(2));
    if (!donorName) continue;
    if (donorName.trim().toUpperCase().startsWith(IMPORT_SKIP_DONOR_NAME_PREFIX.toUpperCase())) {
      continue;
    }

    const qcRaw = cellText(row.getCell(3));
    const paidRaw = cellText(row.getCell(5));
    const quotaFloat = cellNumber(row.getCell(3));
    const amountPaid = cellNumber(row.getCell(5));
    const quotaCount =
      quotaFloat !== null && Number.isInteger(quotaFloat) && quotaFloat > 0
        ? quotaFloat
        : null;
    const paymentDate = parsePaymentDate(row.getCell(6));

    if (quotaCount === null || quotaCount <= 0) {
      const hint = qcRaw || (quotaFloat !== null ? String(quotaFloat) : "");
      skippedRows.push({
        rowNumber: r,
        reason: `Quantidade de cotas inválida (use número inteiro > 0): "${hint}"`,
      });
      continue;
    }
    if (amountPaid === null || amountPaid < 0) {
      skippedRows.push({ rowNumber: r, reason: `Valor pago inválido: "${paidRaw}"` });
      continue;
    }
    if (!paymentDate) {
      skippedRows.push({ rowNumber: r, reason: "Data de pagamento ausente ou inválida." });
      continue;
    }
    if (donorName.length < 2) {
      skippedRows.push({ rowNumber: r, reason: "Nome do participante muito curto." });
      continue;
    }

    donations.push({
      donorName,
      quotaCount,
      amountPaid,
      paymentDate,
    });
  }

  return { donations, skippedRows };
}
