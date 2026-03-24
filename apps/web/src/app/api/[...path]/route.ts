import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getApiBaseUrl(): string {
  const internal = process.env.API_INTERNAL_URL?.trim().replace(/\/+$/, "");
  if (internal) return internal;

  const publicApi = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (publicApi) return publicApi;

  // Em produção sem API_INTERNAL_URL, tenta o hostname padrão do serviço Docker
  if (process.env.NODE_ENV === "production") return "http://api:3001";
  return "http://127.0.0.1:3001";
}

/**
 * Constrói a URL de destino evitando duplicar "/api" caso a base já termine com ele.
 * Ex.: API_INTERNAL_URL=http://api:3001 + path=["stats","summary"] → http://api:3001/stats/summary
 */
function buildTargetUrl(base: string, segments: string[]): URL {
  const joinedPath = segments.join("/");
  const baseCleaned = base.replace(/\/api\/*$/, "");
  return new URL(`${baseCleaned}/${joinedPath}`);
}

async function proxyToApi(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const base = getApiBaseUrl();
  let segments: string[] = [];
  let target: URL;

  try {
    const resolved = await ctx.params;
    segments = Array.isArray(resolved.path) ? resolved.path : [];
    target = buildTargetUrl(base, segments);
    target.search = request.nextUrl.search;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`[api-proxy] Erro ao construir URL — base="${base}" segments="${segments.join("/")}" — ${detail}`);
    return NextResponse.json(
      {
        error: "proxy_url_error",
        message: "Não foi possível construir a URL de destino da API.",
        base,
        segments,
        detail,
      },
      { status: 502 }
    );
  }

  const targetStr = target.toString();
  const method = request.method.toUpperCase();

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  const hasBody = !["GET", "HEAD"].includes(method);

  let upstream: Response;
  try {
    const init: RequestInit & { duplex?: "half" } = {
      method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: "manual",
      cache: "no-store",
    };
    if (hasBody) init.duplex = "half";
    upstream = await fetch(targetStr, init);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`[api-proxy] ${method} ${targetStr} — falha de conexão: ${detail}`);
    return NextResponse.json(
      {
        error: "proxy_upstream_error",
        message: "Não foi possível conectar ao serviço de API.",
        target: targetStr,
        method,
        detail,
        hint: "Verifique se API_INTERNAL_URL está configurado corretamente no Dokploy.",
      },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  if (!upstream.ok) {
    console.warn(`[api-proxy] ${method} ${targetStr} → ${upstream.status} ${upstream.statusText}`);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

/** Wrapper externo que garante que QUALQUER exceção não tratada vire um 502 JSON (nunca 500 opaco). */
async function safeProxy(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  try {
    return await proxyToApi(request, ctx);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`[api-proxy] Exceção inesperada no proxy — ${detail}`);
    return NextResponse.json(
      {
        error: "proxy_internal_error",
        message: "Erro interno no proxy da API.",
        detail,
      },
      { status: 502 }
    );
  }
}

export async function GET(r: NextRequest, c: { params: Promise<{ path: string[] }> }) {
  return safeProxy(r, c);
}
export async function POST(r: NextRequest, c: { params: Promise<{ path: string[] }> }) {
  return safeProxy(r, c);
}
export async function PUT(r: NextRequest, c: { params: Promise<{ path: string[] }> }) {
  return safeProxy(r, c);
}
export async function PATCH(r: NextRequest, c: { params: Promise<{ path: string[] }> }) {
  return safeProxy(r, c);
}
export async function DELETE(r: NextRequest, c: { params: Promise<{ path: string[] }> }) {
  return safeProxy(r, c);
}
export async function OPTIONS(r: NextRequest, c: { params: Promise<{ path: string[] }> }) {
  return safeProxy(r, c);
}
