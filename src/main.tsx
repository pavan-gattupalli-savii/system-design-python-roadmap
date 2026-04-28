import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Bootstrap prefetch: ONE request warms Neon DB and seeds all TanStack caches.
// /api/bootstrap fetches roadmap + readings + interviews + experiences in a
// single server-side Promise.all, so cold Neon pays one connection cost instead
// of four. Data is seeded into TanStack cache so navigating to any tab is
// instant even on slow mobile networks.
import { apiFetch } from "./api/client";

(async () => {
  try {
    type Boot = {
      roadmap:     unknown[];
      readings:    unknown[];
      interviews:  unknown[];
      experiences: unknown[];
    };
    const boot = await apiFetch<Boot>("/api/bootstrap?lang=python");
    queryClient.setQueryData(["roadmap",     "python"],  boot.roadmap);
    queryClient.setQueryData(["readings",    "newest"],  { data: boot.readings,    page: 1, limit: boot.readings.length    });
    queryClient.setQueryData(["interviews",  "newest"],  { data: boot.interviews,  page: 1, limit: boot.interviews.length  });
    queryClient.setQueryData(["experiences", "newest"],  { data: boot.experiences, page: 1, limit: boot.experiences.length });
  } catch {
    // Silently ignore — components will self-fetch with retry on failure.
  }
})();

// One-time cleanup: upvotes and "practiced" flags moved from browser-local storage
// to per-user DB rows. Drop the legacy keys so they don't sit in storage forever.
try {
  ["sd_my_votes_v1", "sd_exp_votes_v1", "sd_practiced_v1"].forEach((k) => {
    localStorage.removeItem(k);
  });
} catch {
  // ignore — private browsing, storage disabled, etc.
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
