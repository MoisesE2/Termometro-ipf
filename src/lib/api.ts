// Base do backend: por padrão usa caminho relativo para funcionar atrás do NGINX (ex.: /api)
// Se precisar apontar para outro host, defina NEXT_PUBLIC_API_BASE_URL (ex.: https://api.seudominio.com)
export const API_BASE_URL: string = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // Se NEXT_PUBLIC_API_BASE_URL não estiver definido, use caminho relativo (NGINX proxy -> 127.0.0.1:3001)
  if (!API_BASE_URL) return normalizedPath;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function fetchJson(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(buildApiUrl(path), options);
}



