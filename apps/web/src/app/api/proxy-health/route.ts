import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Rota de diagnóstico — acesse GET /api/proxy-health para ver as variáveis de ambiente
 * que o proxy está usando e testar se consegue conectar na API.
 */
export async function GET() {
  const apiInternalUrl = process.env.API_INTERNAL_URL?.trim() ?? null;
  const nextPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? null;
  const nodeEnv = process.env.NODE_ENV ?? "unknown";

  const resolvedBase = apiInternalUrl
    ? apiInternalUrl.replace(/\/+$/, "")
    : nodeEnv === "production"
    ? "http://api:3001"
    : "http://127.0.0.1:3001";

  let pingStatus: number | null = null;
  let pingError: string | null = null;
  let pingBody: string | null = null;

  try {
    const res = await fetch(`${resolvedBase}/stats/summary`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    pingStatus = res.status;
    pingBody = await res.text().then((t) => t.slice(0, 300)).catch(() => null);
  } catch (err) {
    pingError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json({
    resolvedBase,
    env: {
      API_INTERNAL_URL: apiInternalUrl ?? "(não definida)",
      NEXT_PUBLIC_API_BASE_URL: nextPublicApiBaseUrl ?? "(não definida)",
      NODE_ENV: nodeEnv,
    },
    ping: {
      url: `${resolvedBase}/stats/summary`,
      status: pingStatus,
      error: pingError,
      body: pingBody,
    },
  });
}
