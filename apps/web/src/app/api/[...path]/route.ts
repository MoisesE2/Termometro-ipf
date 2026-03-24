import { NextRequest } from "next/server";

export const runtime = "nodejs";

function getApiBaseUrl(): string {
  const internal = process.env.API_INTERNAL_URL?.trim();
  if (internal) return internal.replace(/\/+$/, "");

  const publicApi = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (publicApi) return publicApi.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production") {
    return "http://api:3001";
  }
  return "http://127.0.0.1:3001";
}

async function proxyToApi(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await ctx.params;
  const joinedPath = Array.isArray(path) ? path.join("/") : "";
  const base = getApiBaseUrl();
  const target = new URL(`${base}/${joinedPath}`);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const upstream = await fetch(target.toString(), {
    method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

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

