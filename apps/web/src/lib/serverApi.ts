/**
 * URL do backend Fastify para chamadas feitas no servidor Next (Route Handlers).
 * Em Docker, defina API_INTERNAL_URL (ex.: http://api:3001).
 */
export function getServerApiBaseUrl(): string {
  const u =
    process.env.API_INTERNAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (u) return u.replace(/\/+$/, "");
  return "http://127.0.0.1:3001";
}
