// ── useMyProfile hook ─────────────────────────────────────────────────────────
// Fetches /api/me when signed in. Disabled when there's no user.
// Returns the standard React Query state shape so callers can branch on
// `data?.role` safely.

import { useQuery } from "@tanstack/react-query";
import { fetchMe, type MyProfile } from "../api/me";
import { useAuth } from "../lib/auth";

export function useMyProfile() {
  const { user } = useAuth();
  return useQuery<MyProfile>({
    queryKey: ["me", user?.id],
    queryFn:  fetchMe,
    enabled:  !!user,
    staleTime: 30_000,
  });
}
