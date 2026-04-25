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

export interface RequestOtpResponse {
  ok:      true;
  message: string;
}

export function requestOtp(email: string): Promise<RequestOtpResponse> {
  return apiFetch<RequestOtpResponse>("/api/auth/request-otp", {
    method: "POST",
    body:   JSON.stringify({ email }),
  });
}

export interface VerifyOtpResponse {
  ok:    true;
  /** Bearer fallback for cookie-blocking browsers. */
  token: string;
}

export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResponse> {
  const response = await apiFetch<VerifyOtpResponse>("/api/auth/verify-otp", {
    method: "POST",
    body:   JSON.stringify({ email, code }),
  });
  if (response.token) setStoredSessionToken(response.token);
  return response;
}

export async function signOut(): Promise<void> {
  try {
    await apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
  } finally {
    setStoredSessionToken(null);
  }
}

export interface UseAuthResult {
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
    refetchOnWindowFocus: true,
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
