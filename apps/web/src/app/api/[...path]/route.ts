import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getApiBaseUrl(): string {
  const internal = process.env.API_INTERNAL_URL?.trim().replace(/\/+$/, "");
  if (internal) return internal;

  const publicApi = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (publicApi) return publicApi;

  if (process.env.NODE_ENV === "production") return "http://api:3001";
  return "http://127.0.0.1:3001";
}

/**
 * Remove segmentos de prefixo redundantes gerados quando API_INTERNAL_URL já contém "/api"
 * ou quando o path resolve "/api/api/...".
 */
function buildTargetUrl(base: string, segments: string[]): URL {
  const joinedPath = segments.join("/");
  // Evita duplicar "/api" se a base já terminar com ele
  const baseCleaned = base.replace(/\/api$/, "");
  return new URL(`${baseCleaned}/${joinedPath}`);
}

async function proxyToApi(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await ctx.params;
  const segments = Array.isArray(path) ? path : [];
  const base = getApiBaseUrl();
  let target: URL;

  try {
    target = buildTargetUrl(base, segments);
    target.search = request.nextUrl.search;
  } catch {
    return NextResponse.json(
      { message: "Configuração de URL da API inválida.", target: base },
      { status: 502 }
    );
  }

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[api-proxy] Falha ao conectar upstream: ${target.toString()} — ${reason}`);
    return NextResponse.json(
      {
        message: "Não foi possível conectar ao serviço de API.",
        target: target.toString(),
        detail: reason,
      },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxyToApi(request, ctx);
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxyToApi(request, ctx);
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxyToApi(request, ctx);
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxyToApi(request, ctx);
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxyToApi(request, ctx);
}

export async function OPTIONS(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return proxyToApi(request, ctx);
}
