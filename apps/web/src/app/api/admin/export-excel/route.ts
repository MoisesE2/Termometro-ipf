import { NextRequest, NextResponse } from "next/server";
import {
  createDonationsExcelBuffer,
  type DonationExcelRow,
} from "@/lib/exportDonationsExcelCore";

export const runtime = "nodejs";

const MAX_FILENAME_LEN = 180;

function safeFilename(name: unknown, fallback: string): string {
  if (typeof name !== "string" || !name.trim()) return fallback;
  const base = name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_FILENAME_LEN);
  return base.toLowerCase().endsWith(".xlsx") ? base : `${base}.xlsx`;
}

function parseRows(body: unknown): DonationExcelRow[] {
  if (!body || typeof body !== "object" || !("rows" in body)) return [];
  const rows = (body as { rows: unknown }).rows;
  if (!Array.isArray(rows)) return [];
  const out: DonationExcelRow[] = [];
  for (const r of rows) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const donorName = typeof o.donorName === "string" ? o.donorName : "";
    const quotaCount = Number(o.quotaCount);
    const quotaUnitValue = Number(o.quotaUnitValue);
    const amountPaid = Number(o.amountPaid);
    const paymentDate = typeof o.paymentDate === "string" ? o.paymentDate : "";
    out.push({
      donorName,
      quotaCount: Number.isFinite(quotaCount) ? quotaCount : 0,
      quotaUnitValue: Number.isFinite(quotaUnitValue) ? quotaUnitValue : 0,
      amountPaid: Number.isFinite(amountPaid) ? amountPaid : 0,
      paymentDate,
    });
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const template =
    body &&
    typeof body === "object" &&
    "template" in body &&
    (body as { template?: unknown }).template === true;

  const templateKindRaw =
    body && typeof body === "object" && "templateKind" in body
      ? (body as { templateKind?: unknown }).templateKind
      : undefined;
  const templateKind =
    templateKindRaw === "preenchimento" ? "preenchimento" : "vazio";

  const rows = template ? [] : parseRows(body);
  const defaultName = template
    ? templateKind === "preenchimento"
      ? "Modelo-Preenchimento-Cotas-IPF.xlsx"
      : "Modelo-Cotas-IPF.xlsx"
    : `Capitalizacao-Cotas-IPF-${new Date().toISOString().slice(0, 10)}.xlsx`;

  const filename =
    body && typeof body === "object" && "filename" in body
      ? safeFilename((body as { filename?: unknown }).filename, defaultName)
      : defaultName;

  const excelOptions =
    template && templateKind === "preenchimento"
      ? {
          fillerBlankRows: 30,
          includeInstructionsSheet: true as const,
          includeFirstFillerExample: true,
        }
      : undefined;

  try {
    const buffer = await createDonationsExcelBuffer(rows, excelOptions);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[export-excel]", e);
    return NextResponse.json(
      { error: "Falha ao gerar Excel" },
      { status: 500 }
    );
  }
}
