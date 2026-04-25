// ── Shared React Query client ────────────────────────────────────────────────
// Aggressive client-side caching so flipping between tabs is instant after
// the first paint. The 60s staleTime mirrors the API's Cache-Control max-age.

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:  60_000,            // 1 min: matches server Cache-Control
      gcTime:     5 * 60_000,        // keep cached data warm for 5 min
      refetchOnWindowFocus: false,   // a refresh shouldn't trigger another roundtrip
      retry:      1,                 // single retry on transient network errors
    },
  },
});
