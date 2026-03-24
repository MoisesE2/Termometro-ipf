import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Rota de diagnóstico — acesse GET /api/proxy-health para ver as variáveis de ambiente
 * e testar quais hostnames internos conseguem atingir a API.
 *
 * URL em produção: https://ipbfarol.org/api/proxy-health
 */

async function tryPing(url: string): Promise<{ url: string; status: number | null; ok: boolean; error: string | null; body: string | null }> {
  try {
    const res = await fetch(`${url}/stats/summary`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    const body = await res.text().then((t) => t.slice(0, 400)).catch(() => null);
    return { url: `${url}/stats/summary`, status: res.status, ok: res.ok, error: null, body };
  } catch (err) {
    return {
      url: `${url}/stats/summary`,
      status: null,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      body: null,
    };
  }
}

export async function GET() {
  const apiInternalUrl = process.env.API_INTERNAL_URL?.trim() ?? null;
  const nextPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? null;
  const nodeEnv = process.env.NODE_ENV ?? "unknown";

  // URL configurada (a que o proxy usa de verdade)
  const resolvedBase = apiInternalUrl
    ? apiInternalUrl.replace(/\/+$/, "")
    : nodeEnv === "production"
    ? "http://api:3001"
    : "http://127.0.0.1:3001";

  // Testa a URL configurada + candidatos comuns do Dokploy
  const candidates = [
    resolvedBase,
    ...(resolvedBase !== "http://api:3001" ? ["http://api:3001"] : []),
    "http://127.0.0.1:3001",
    "http://localhost:3001",
  ].filter((v, i, arr) => arr.indexOf(v) === i); // deduplicar

  const pings = await Promise.all(candidates.map(tryPing));

  const configured = pings[0];
  const working = pings.find((p) => p.ok);

  return NextResponse.json({
    configured: {
      base: resolvedBase,
      result: configured,
    },
    env: {
      API_INTERNAL_URL: apiInternalUrl ?? "(não definida — use o painel Dokploy > Environment)",
      NEXT_PUBLIC_API_BASE_URL: nextPublicApiBaseUrl ?? "(não definida)",
      NODE_ENV: nodeEnv,
    },
    allCandidates: pings,
    suggestion: working
      ? working.url !== `${resolvedBase}/stats/summary`
        ? `✅ Funcionou em ${working.url.replace("/stats/summary", "")}. Defina API_INTERNAL_URL=${working.url.replace("/stats/summary", "")} no Dokploy.`
        : `✅ Configuração correta: ${resolvedBase}`
      : `❌ Nenhum hostname funcionou. Abra o terminal do serviço web no Dokploy e rode: curl http://api:3001/stats/summary`,
  });
}
