// ── Sign-in page (email + password) ──────────────────────────────────────────
// Single-step form with Sign in / Create account tabs.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { APP_TITLE, APP_SUBTITLE } from "../constants/app";
import { FONT_STACK } from "../constants/theme";
import { login, register, useAuth, useInvalidateAuth } from "../lib/auth";

type Mode = "signin" | "register";

function safeNext(raw: string | null): string {
  if (!raw)                 return "/app/overview";
  if (!raw.startsWith("/")) return "/app/overview";
  if (raw.startsWith("//")) return "/app/overview";
  return raw;
}

export default function SignIn() {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const invalidate = useInvalidateAuth();
  const { user, isLoading } = useAuth();

  const next = useMemo(() => safeNext(params.get("next")), [params]);

  const [mode,        setMode]        = useState<Mode>("signin");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [busy,        setBusy]        = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => { document.title = `Sign in · ${APP_TITLE}`; }, []);

  useEffect(() => {
    if (!isLoading && user) navigate(next, { replace: true });
  }, [isLoading, user, navigate, next]);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setPassword("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "register") {
        await register(trimEmail, password, displayName.trim() || undefined);
      } else {
        await login(trimEmail, password);
      }
      await invalidate();
      navigate(next, { replace: true });
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      fontFamily: FONT_STACK,
      minHeight: "100vh",
      background: "radial-gradient(circle at 12% -10%, #6366f12e 0%, transparent 45%), radial-gradient(circle at 95% 110%, #0ea5e91f 0%, transparent 40%), var(--bg-page)",
      color: "var(--text-body)",
      display: "flex", flexDirection: "column",
    }}>
      <SignInHeader />

      <main style={{
        flex: 1, display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "clamp(16px, 5vw, 32px)",
        paddingBottom: "clamp(32px, 8vw, 64px)",
      }}>
        <div style={{
          width: "100%", maxWidth: 420,
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.18)",
          padding: "clamp(20px, 5vw, 28px)",
          marginTop: "clamp(8px, 4vw, 32px)",
          display: "flex", flexDirection: "column",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4, marginBottom: 20,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10, padding: 4,
          }}>
            {(["signin", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                style={{
                  flex: 1, padding: "8px 12px", border: "none",
                  borderRadius: 7,
                  background: mode === m ? "var(--bg-panel)" : "transparent",
                  boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.25)" : "none",
                  color: mode === m ? "var(--text-bright)" : "var(--text-muted)",
                  fontFamily: "inherit", fontSize: 13.5, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-heading)", letterSpacing: -0.3, lineHeight: 1.25 }}>
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginTop: 6 }}>
              {mode === "signin"
                ? "Sign in with your email and password."
                : "Pick a password to keep your progress synced."}
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate>
            {mode === "register" && (
              <>
                <FieldLabel>Display name <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span></FieldLabel>
                <input
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  disabled={busy}
                  style={{ ...inputStyle(false), marginBottom: 14 }}
                />
              </>
            )}

            <FieldLabel>Email</FieldLabel>
            <input
              type="email"
              autoComplete="email"
              autoFocus
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={busy}
              style={{ ...inputStyle(false), marginBottom: 14 }}
            />

            <FieldLabel>Password</FieldLabel>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Min. 8 characters" : "Password"}
                disabled={busy}
                style={{ ...inputStyle(false), paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", padding: 4, display: "flex", alignItems: "center",
                }}
              >
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {error && <ErrorLine text={error} />}

            <PrimaryButton type="submit" busy={busy} disabled={busy || !email.trim() || !password}>
              {busy
                ? (mode === "signin" ? "Signing in…" : "Creating account…")
                : (mode === "signin" ? "Sign in" : "Create account")}
            </PrimaryButton>
          </form>

          <div style={{
            marginTop: 18, paddingTop: 14,
            borderTop: "1px solid var(--border-subtle)",
            fontSize: 11, color: "var(--text-muted)", lineHeight: 1.55,
          }}>
            Your progress and submissions are tied to your account.
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SignInHeader() {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px clamp(16px, 5vw, 28px)",
      maxWidth: 1200, margin: "0 auto", width: "100%", boxSizing: "border-box",
    }}>
      <Link to="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, color: "#fff", fontWeight: 800,
        }}>
          🐍
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14.5, color: "var(--text-heading)", letterSpacing: -0.3 }}>
            {APP_TITLE}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{APP_SUBTITLE}</div>
        </div>
      </Link>
      <Link to="/app/overview" style={{ fontSize: 12.5, color: "var(--text-secondary)", textDecoration: "none" }}>
        Browse →
      </Link>
    </header>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
      textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6,
    }}>
      {children}
    </label>
  );
}

function inputStyle(invalid: boolean): React.CSSProperties {
  return {
    width: "100%", boxSizing: "border-box",
    background: "var(--bg-card)",
    border: "1px solid " + (invalid ? "#ef4444" : "var(--border)"),
    borderRadius: 9, padding: "11px 13px", fontSize: 14,
    color: "var(--text-bright)", fontFamily: "inherit",
    outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
  };
}

function PrimaryButton({
  type = "button", busy, disabled, children, onClick,
}: {
  type?: "button" | "submit";
  busy?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        marginTop: 14,
        width: "100%", padding: "11px 18px",
        background: disabled ? "#6366f155" : "linear-gradient(135deg, #6366f1, #4f46e5)",
        color: "#fff", border: "none", borderRadius: 9,
        fontSize: 14, fontWeight: 700, fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 6px 18px #6366f155",
        transition: "transform 0.08s, box-shadow 0.15s",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <div style={{ marginTop: 7, fontSize: 12, color: "#fca5a5", display: "flex", alignItems: "center", gap: 6 }}>
      <span aria-hidden>⚠</span>
      {text}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 13, height: 13, borderRadius: "50%",
        border: "2px solid #ffffff66", borderTopColor: "#fff",
        display: "inline-block", animation: "sd-spin 0.7s linear infinite",
      }}
    />
  );
}
