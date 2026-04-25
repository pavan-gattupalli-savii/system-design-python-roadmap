import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
