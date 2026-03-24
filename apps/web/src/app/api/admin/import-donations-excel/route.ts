import { NextRequest, NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/lib/serverApi";
import { parseDonationsImportExcelBuffer } from "@/lib/parseDonationsImportExcel";
import { partitionDonationsForApiImport } from "@/lib/donationImportValidation";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const dryRunRaw = formData.get("dryRun");
  const dryRun =
    dryRunRaw === "1" ||
    dryRunRaw === "true" ||
    (typeof dryRunRaw === "string" && dryRunRaw.toLowerCase() === "on");

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Envie um arquivo no campo "file".' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande (máx. 6 MB)." },
      { status: 400 }
    );
  }

  const ab = await file.arrayBuffer();

  let parsed;
  try {
    parsed = await parseDonationsImportExcelBuffer(ab);
  } catch (e) {
    console.error("[import-donations-excel] parse", e);
    return NextResponse.json(
      { error: "Não foi possível ler o Excel. Use o modelo do painel (.xlsx)." },
      { status: 400 }
    );
  }

  if (dryRun) {
    const { invalidApiRows, wouldImportCount } = partitionDonationsForApiImport(
      parsed.donations
    );
    const overLimit = parsed.donations.length > 500;
    const readyToImport =
      !overLimit &&
      invalidApiRows.length === 0 &&
      parsed.donations.length > 0;

    return NextResponse.json({
      dryRun: true,
      parsedOkCount: parsed.donations.length,
      wouldImportCount,
      invalidApiRows,
      skippedRows: parsed.skippedRows,
      overLimit,
      readyToImport,
    });
  }

  if (parsed.donations.length === 0) {
    return NextResponse.json(
      {
        error: "Nenhuma linha válida para importar.",
        skippedRows: parsed.skippedRows,
        created: 0,
        failed: [],
      },
      { status: 400 }
    );
  }

  if (parsed.donations.length > 500) {
    return NextResponse.json(
      {
        error: "Máximo de 500 linhas por importação. Divida o arquivo em partes.",
        skippedRows: parsed.skippedRows,
        created: 0,
        failed: [],
      },
      { status: 400 }
    );
  }

  const apiBase = getServerApiBaseUrl();
  const bulkRes = await fetch(`${apiBase}/donations/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify({ donations: parsed.donations }),
  });

  const data = await bulkRes.json().catch(() => ({}));

  if (!bulkRes.ok) {
    return NextResponse.json(
      {
        error:
          typeof data === "object" && data && "message" in data
            ? String((data as { message: string }).message)
            : "Erro ao gravar na API.",
        skippedRows: parsed.skippedRows,
        ...(typeof data === "object" && data ? data : {}),
      },
      { status: bulkRes.status }
    );
  }

  return NextResponse.json({
    ...data,
    skippedRows: parsed.skippedRows,
  });
}
