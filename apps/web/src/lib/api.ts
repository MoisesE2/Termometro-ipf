/**
 * Sempre retorna uma URL relativa /api/... para que o browser passe pelo proxy
 * Next.js em app/api/[...path]/route.ts, que resolve o endereço interno da API.
 *
 * Nunca usa NEXT_PUBLIC_API_BASE_URL para chamadas do cliente porque esse valor
 * pode ser um endereço Docker interno (ex.: http://api:3001) inacessível ao browser.
 */
export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/api${normalizedPath}`;
}

export async function fetchJson(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(buildApiUrl(path), options);
}
