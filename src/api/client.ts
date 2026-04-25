// ── Frontend API base client ──────────────────────────────────────────────────
// Sends every request with `credentials: "include"` so the `sd_session`
// HTTP-only cookie travels cross-origin (GitHub Pages → Railway). For
// browsers that block third-party cookies entirely, we also fall back to a
// Bearer token persisted in localStorage by the sign-in flow.

const BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:3001";

const TOKEN_STORAGE_KEY = "sd_session_token";

export function getStoredSessionToken(): string | null {
  try {
    return typeof window === "undefined"
      ? null
      : window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string | null): void {
  try {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else       window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // localStorage may be disabled (Safari private mode) — silently degrade.
  }
}

type ApiError = { error: string };

interface ApiFetchOptions extends RequestInit {
  /** Hard request timeout, in milliseconds. Default: 15000. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

export async function apiFetch<T>(path: string, init?: ApiFetchOptions): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  const token = getStoredSessionToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const ctrl = new AbortController();
  // Caller-provided signals win — we only abort on our own timeout.
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timer     = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers,
      credentials: "include",
      signal: init?.signal ?? ctrl.signal,
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({ error: res.statusText }))) as ApiError;
      const err = new Error(body.error ?? `HTTP ${res.status}`);
      (err as Error & { status?: number }).status = res.status;
      throw err;
    }

    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      const timeoutErr = new Error(`Request timed out after ${timeoutMs}ms`);
      (timeoutErr as Error & { status?: number }).status = 408;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
