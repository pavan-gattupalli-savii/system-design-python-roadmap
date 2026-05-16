// ── Frontend auth client ──────────────────────────────────────────────────────
// One small wrapper around the /api/auth/* endpoints + a `useAuth()` React hook
// backed by react-query, so anything mounting under <RequireAuth/> just sees
// `{ user, isLoading }` and never touches HTTP itself.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiFetch,
  setStoredSessionToken,
} from "../api/client";

export interface AuthUser {
  id:          string;
  email:       string;
  displayName: string;
  github:      string | null;
  linkedin:    string | null;
  role:        "user" | "admin";
}

export const authKeys = {
  me: ["auth", "me"] as const,
};

/**
 * Returns the signed-in user, or `null` when unauthenticated.
 *
 * We treat *both* 401 (no/expired session) and timeouts as "anonymous" so a
 * sluggish backend can't lock the SPA in a permanent <Loading/> state. The
 * worst case is a logged-in user briefly seeing the public CTA — the next
 * `useAuth` refetch will fix it once the network is healthy again.
 */
export async function fetchMe(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>("/api/auth/me", { timeoutMs: 6000 });
  } catch (err) {
    const status = (err as Error & { status?: number }).status;
    if (status === 401 || status === 408 || status === 503) return null;
    throw err;
  }
}

interface LoginResponse { ok: true; token: string; }

export async function register(email: string, password: string, displayName?: string): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>("/api/auth/register", {
    method: "POST",
    body:   JSON.stringify({ email, password, displayName }),
  });
  if (res.token) setStoredSessionToken(res.token);
  return res;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body:   JSON.stringify({ email, password }),
  });
  if (res.token) setStoredSessionToken(res.token);
  return res;
}

export async function signOut(): Promise<void> {
  try {
    await apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
  } finally {
    setStoredSessionToken(null);
  }
}

interface UseAuthResult {
  user:      AuthUser | null;
  isLoading: boolean;
  isError:   boolean;
  refetch:   () => Promise<unknown>;
}

export function useAuth(): UseAuthResult {
  const q = useQuery({
    queryKey:    authKeys.me,
    queryFn:     fetchMe,
    staleTime:   30_000,
    gcTime:      5 * 60 * 1000,
    retry:       false,
    refetchOnWindowFocus: false,
  });
  return {
    user:      q.data ?? null,
    isLoading: q.isLoading,
    isError:   q.isError,
    refetch:   q.refetch,
  };
}

/** Convenience for sign-in / sign-out flows that need to invalidate the cache. */
export function useInvalidateAuth() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: authKeys.me });
}
