export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function fetchJson(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(buildApiUrl(path), options);
}



