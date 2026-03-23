// Base do backend:
// - Com NEXT_PUBLIC_API_BASE_URL definido: usa host explícito (ex.: https://api.seudominio.com)
// - Sem variável: usa prefixo /api para evitar colisão com rotas do frontend
export const API_BASE_URL: string = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) return `/api${normalizedPath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function fetchJson(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(buildApiUrl(path), options);
}



