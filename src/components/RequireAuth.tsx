// ── Auth guards for protected routes ─────────────────────────────────────────
// `RequireAuth`  — shows a sign-in CTA panel for anonymous visitors instead of
//                  silently redirecting (so users know what's happening if the
//                  click landed them on /app/readings/submit while logged out).
// `RequireAdmin` — adds a role check on top.

import { type ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

function buildSignInRedirect(pathname: string, search: string): string {
  const next = encodeURIComponent(pathname + search);
  return `/sign-in?next=${next}`;
}

function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div style={{
      flex: 1, display: "grid", placeItems: "center",
      color: "var(--text-muted)", fontSize: 13,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden
          style={{
            width: 14, height: 14, borderRadius: "50%",
            border: "2px solid var(--border)", borderTopColor: "#6366f1",
            animation: "sd-spin 0.7s linear infinite",
          }}
        />
        {label}
      </div>
    </div>
  );
}

function SignInGate({
  title,
  message,
  to,
}: {
  title:   string;
  message: string;
  to:      string;
}) {
  return (
    <div style={{
      flex: 1, display: "grid", placeItems: "center",
      padding: "32px 20px",
    }}>
      <div style={{
        maxWidth: 460, width: "100%",
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "26px 28px", textAlign: "center",
      }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
        <div style={{
          fontSize: 18, fontWeight: 800, color: "var(--text-heading)",
          marginBottom: 8, letterSpacing: -0.2,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 13, color: "var(--text-secondary)",
          lineHeight: 1.6, marginBottom: 18,
        }}>
          {message}
        </div>
        <Link
          to={to}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#fff", border: "none", borderRadius: 9,
            padding: "10px 22px", fontSize: 13, fontWeight: 700,
            textDecoration: "none", boxShadow: "0 6px 18px #6366f155",
          }}
        >
          Sign in to continue
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loading />;
  if (!user) {
    return (
      <SignInGate
        title="Sign in to continue"
        message="This page is just for signed-in members — it lets you publish, save progress, and contribute to the community."
        to={buildSignInRedirect(location.pathname, location.search)}
      />
    );
  }
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loading />;
  if (!user) {
    return (
      <SignInGate
        title="Admins only"
        message="Sign in with an admin account to access the moderation queue."
        to={buildSignInRedirect(location.pathname, location.search)}
      />
    );
  }
  if (user.role !== "admin") return <Navigate to="/app/overview" replace />;
  return <>{children}</>;
}
