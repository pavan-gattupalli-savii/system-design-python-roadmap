// ── Frontend API base client ──────────────────────────────────────────────────
// All fetch calls go through here so the base URL is always consistent.
// Set VITE_API_BASE_URL in .env for local dev, or inject it in CI for production.

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3001";

type ApiError = { error: string };

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({ error: res.statusText }))) as ApiError;
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
