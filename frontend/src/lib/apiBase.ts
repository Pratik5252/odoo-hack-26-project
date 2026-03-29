/**
 * Backend origin. Defaults to local API; set VITE_API_URL in production.
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}
