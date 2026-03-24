import type { Borders, Row, Workbook } from "exceljs";
import { IMPORT_SKIP_DONOR_NAME_PREFIX } from "@/lib/excelImportConstants";

/** Linha compatível com o modelo "Capitalização Cotas compra Imóvel IPF.xlsx" (Plan1). */
export type DonationExcelRow = {
  donorName: string;
  quotaCount: number;
  quotaUnitValue: number;
  amountPaid: number;
  paymentDate: string;
};

const GREEN_DARK = "FF1F5830";
const GREEN_HEADER = "FF2E7D40";
const ZEBRA = "FFF1F8F4";
const WHITE = "FFFFFFFF";

const borderThin: Partial<Borders> = {
  top: { style: "thin", color: { argb: "FFCFD8DC" } },
  left: { style: "thin", color: { argb: "FFCFD8DC" } },
  bottom: { style: "thin", color: { argb: "FFCFD8DC" } },
  right: { style: "thin", color: { argb: "FFCFD8DC" } },
};

/**
 * Converte data (YYYY-MM-DD da API) para número serial do Excel.
 */
export function paymentDateToExcelSerial(paymentDate: string): number {
  const part = paymentDate.split("T")[0] ?? "";
  const [y, m, d] = part.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const utc = Date.UTC(y, m - 1, d);
  const excelEpoch = Date.UTC(1899, 11, 30);
  return Math.round((utc - excelEpoch) / 86400000);
}

export type ExcelBuildOptions = {
  /** Linhas vazias formatadas para digitação (modelo de preenchimento). */
  fillerBlankRows?: number;
  /** Segunda aba com orientações de preenchimento. */
  includeInstructionsSheet?: boolean;
  /** Primeira linha do bloco com dados fictícios de exemplo (só com `fillerBlankRows` > 0). */
  includeFirstFillerExample?: boolean;
};

const EXAMPLE_FILLER_ROW: DonationExcelRow = {
  donorName: `${IMPORT_SKIP_DONOR_NAME_PREFIX} Maria Silva — substitua ou apague esta linha`,
  quotaCount: 2,
  quotaUnitValue: 200,
  amountPaid: 400,
  paymentDate: "2026-03-15",
};

function styleDataRow(
  row: Row,
  rowIndex: number,
  values: {
    n: number | string | null;
    nome: string | null;
    qc: number | string | null;
    vu: number | string | null;
    vp: number | string | null;
    dt: number | string | null;
  },
  rowOpts?: { exampleRow?: boolean }
) {
  row.getCell(1).value = values.n;
  row.getCell(2).value = values.nome;
  row.getCell(3).value = values.qc;
  row.getCell(4).value = values.vu;
  row.getCell(5).value = values.vp;
  row.getCell(6).value = values.dt;
  row.getCell(7).value = "";

  row.getCell(3).numFmt = "0";
  row.getCell(4).numFmt = '"R$" #,##0.00';
  row.getCell(5).numFmt = '"R$" #,##0.00';
  row.getCell(6).numFmt = "dd/mm/yyyy";

  const zebra = rowIndex % 2 === 1;
  const exampleBg = "FFE8F5E9";
  for (let c = 1; c <= 7; c++) {
    const cell = row.getCell(c);
    cell.border = borderThin;
    cell.alignment = {
      horizontal: c === 2 ? "left" : c === 1 ? "center" : "center",
      vertical: "middle",
      wrapText: c === 2,
    };
    if (rowOpts?.exampleRow) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: exampleBg } };
      cell.font = { italic: true, color: { argb: "FF37474F" }, size: 11 };
    } else if (zebra) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } };
    }
  }
}

function addInstructionsSheet(wb: Workbook) {
  const sh = wb.addWorksheet("Instruções", {
    properties: { defaultRowHeight: 20 },
    views: [{ showGridLines: true }],
  });
  sh.columns = [{ width: 72 }];

  const lines = [
    "MODELO DE PREENCHIMENTO — Capitalização Cotas IPF",
    "",
    'Use a aba "Plan1" para lançar as doações. Preencha a partir da linha 5 (abaixo dos títulos em verde).',
    "",
    "• PARTICIPANTES — Nome completo do doador.",
    "• Quant. COTAS — Número inteiro de cotas adquiridas.",
    "• Valor Cota — Valor unitário de cada cota em reais (ex.: 200).",
    "• Valor Pago — Valor total pago (geralmente cotas × valor da cota).",
    "• Data Pagamento — Informe como data no Excel (dd/mm/aaaa). Pode usar a coluna de data ou formato numérico do Excel.",
    "• SOMA DIÁRIA — Campo opcional do modelo oficial; pode somar valores do dia com fórmulas no Excel, se desejar.",
    "",
    'A primeira linha de dados (linha 5) vem com um EXEMPLO preenchido (nome começa com "[EXEMPLO]"). Substitua pelos dados reais ou apague; na importação pelo painel essa linha é ignorada automaticamente.',
    "",
    'Registro no sistema: após conferir a planilha, cadastre cada doação em "Registrar cotas" no painel administrativo.',
    "",
    "Valor de referência da cota na campanha: R$ 200,00 (ajuste na planilha se houver outro valor acordado).",
  ];

  lines.forEach((text, i) => {
    const row = sh.getRow(i + 1);
    const cell = row.getCell(1);
    cell.value = text;
    cell.alignment = { vertical: "top", wrapText: true };
    if (i === 0) {
      cell.font = { bold: true, size: 14, color: { argb: GREEN_DARK } };
      row.height = 28;
    } else if (text === "") {
      row.height = 6;
    } else {
      row.height = text.startsWith("•") ? 36 : 22;
    }
  });
}

async function buildWorkbook(
  rows: DonationExcelRow[],
  options: ExcelBuildOptions = {}
): Promise<Workbook> {
  const ExcelJS = (await import("exceljs")).default;
  const fillerBlankRows = Math.min(
    200,
    Math.max(0, Math.floor(options.fillerBlankRows ?? 0))
  );
  const includeFirstFillerExample =
    Boolean(options.includeFirstFillerExample) && fillerBlankRows > 0;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Termômetro IPF — Painel Admin";
  wb.created = new Date();

  const ws = wb.addWorksheet("Plan1", {
    properties: { defaultRowHeight: 20 },
    views: [{ state: "frozen", ySplit: 4, showGridLines: true }],
  });

  ws.columns = [
    { key: "n", width: 7 },
    { key: "nome", width: 40 },
    { key: "qc", width: 14 },
    { key: "vu", width: 12 },
    { key: "vp", width: 14 },
    { key: "dt", width: 16 },
    { key: "sd", width: 14 },
  ];

  ws.mergeCells("B1:G1");
  const title = ws.getCell("B1");
  title.value = "CAMPANHA CAPITALIZAÇÃO COMPRA IMÓVEL";
  title.font = { bold: true, size: 14, color: { argb: WHITE } };
  title.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_DARK } };
  title.border = borderThin;
  ws.getRow(1).height = 36;

  ws.getRow(2).height = 8;

  const headers = [
    "",
    "PARTICIPANTES",
    "Quant. COTAS",
    "Valor Cota",
    "Valor Pago",
    "Data Pagamento",
    "SOMA DIÁRIA",
  ];
  const headerRow = ws.getRow(3);
  headers.forEach((text, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = text;
    cell.font = { bold: true, size: 11, color: { argb: WHITE } };
    cell.alignment = {
      horizontal: i <= 1 ? "left" : "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_HEADER } };
    cell.border = borderThin;
  });
  headerRow.height = 26;

  ws.getRow(4).height = 6;

  const sorted = [...rows].sort((a, b) => {
    const da = a.paymentDate.localeCompare(b.paymentDate);
    if (da !== 0) return da;
    return a.donorName.localeCompare(b.donorName, "pt-BR");
  });

  let rowNum = 5;
  sorted.forEach((r, i) => {
    const row = ws.getRow(rowNum);
    const serial = paymentDateToExcelSerial(r.paymentDate);
    styleDataRow(row, i, {
      n: i + 1,
      nome: r.donorName,
      qc: r.quotaCount,
      vu: Number(r.quotaUnitValue),
      vp: Number(r.amountPaid),
      dt: serial,
    });
    rowNum += 1;
  });

  if (rows.length === 0 && fillerBlankRows > 0) {
    const blankCount = includeFirstFillerExample
      ? Math.max(0, fillerBlankRows - 1)
      : fillerBlankRows;

    if (includeFirstFillerExample) {
      const ex = EXAMPLE_FILLER_ROW;
      const row = ws.getRow(rowNum);
      const serial = paymentDateToExcelSerial(ex.paymentDate);
      styleDataRow(
        row,
        0,
        {
          n: 1,
          nome: ex.donorName,
          qc: ex.quotaCount,
          vu: Number(ex.quotaUnitValue),
          vp: Number(ex.amountPaid),
          dt: serial,
        },
        { exampleRow: true }
      );
      rowNum += 1;
    }

    for (let i = 0; i < blankCount; i++) {
      const row = ws.getRow(rowNum);
      const displayIndex = includeFirstFillerExample ? i + 2 : i + 1;
      styleDataRow(row, includeFirstFillerExample ? i + 1 : i, {
        n: displayIndex,
        nome: null,
        qc: null,
        vu: null,
        vp: null,
        dt: null,
      });
      rowNum += 1;
    }
  }

  ws.getCell("A1").border = borderThin;

  const lastRow = Math.max(5, rowNum - 1);
  const hasDataBand = rows.length > 0 || fillerBlankRows > 0;
  if (hasDataBand && lastRow >= 5) {
    ws.autoFilter = {
      from: { row: 3, column: 1 },
      to: { row: lastRow, column: 7 },
    };
  }

  if (options.includeInstructionsSheet) {
    addInstructionsSheet(wb);
  }

  return wb;
}

/** Gera o .xlsx em memória (uso em Route Handler Node — não importar no cliente). */
export async function createDonationsExcelBuffer(
  rows: DonationExcelRow[],
  buildOptions?: ExcelBuildOptions
): Promise<Buffer> {
  const wb = await buildWorkbook(rows, buildOptions);
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
}
