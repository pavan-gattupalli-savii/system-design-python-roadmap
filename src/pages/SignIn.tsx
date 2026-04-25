// ── Sign-in page (email + OTP) ────────────────────────────────────────────────
// Two-step form:
//   1. Email → POST /api/auth/request-otp → "We sent a 6-digit code".
//   2. Code  → POST /api/auth/verify-otp  → cookie set, navigate to ?next=...
//
// Compact, mobile-first card design. Same layout on every viewport — no
// split-pane, no value-prop rail. The OTP step uses six digit inputs that
// shrink to fit narrow screens.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { APP_TITLE, APP_SUBTITLE } from "../constants/app";
import { FONT_STACK } from "../constants/theme";
import {
  requestOtp,
  verifyOtp,
  useAuth,
  useInvalidateAuth,
} from "../lib/auth";

const RESEND_COOLDOWN_S = 60;
const CODE_LENGTH       = 6;

type Step = "email" | "code";

function safeNext(raw: string | null): string {
  if (!raw)                  return "/app/overview";
  if (!raw.startsWith("/"))  return "/app/overview";
  if (raw.startsWith("//"))  return "/app/overview";
  return raw;
}

export default function SignIn() {
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const invalidate   = useInvalidateAuth();
  const { user, isLoading } = useAuth();

  const next = useMemo(() => safeNext(params.get("next")), [params]);

  const [step,   setStep]   = useState<Step>("email");
  const [email,  setEmail]  = useState("");
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [info,   setInfo]   = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const code = digits.join("");

  useEffect(() => { document.title = `Sign in · ${APP_TITLE}`; }, []);

  useEffect(() => {
    if (!isLoading && user) navigate(next, { replace: true });
  }, [isLoading, user, navigate, next]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function onRequestOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null); setInfo(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await requestOtp(trimmed);
      setEmail(trimmed);
      setStep("code");
      setDigits(Array(CODE_LENGTH).fill(""));
      setInfo(`We just emailed a 6-digit code to ${trimmed}.`);
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError((err as Error).message || "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null); setInfo(null);
    if (code.length !== CODE_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setBusy(true);
    try {
      await verifyOtp(email, code);
      await invalidate();
      navigate(next, { replace: true });
    } catch (err) {
      setError((err as Error).message || "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    if (cooldown > 0 || busy) return;
    setDigits(Array(CODE_LENGTH).fill(""));
    await onRequestOtp();
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
          <div style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1.4,
              color: "#a5b4fc", textTransform: "uppercase", marginBottom: 6,
            }}>
              {step === "email" ? "Sign in or sign up" : "Step 2 of 2"}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-heading)", letterSpacing: -0.3, lineHeight: 1.25 }}>
              {step === "email" ? "Welcome — let's get you in" : "Enter your code"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginTop: 6 }}>
              {step === "email"
                ? "We'll email a one-time code. No password needed."
                : <>Sent to <span style={{ color: "var(--text-bright)", fontWeight: 600 }}>{email}</span> — check your inbox.</>}
            </div>
          </div>

          {step === "email" ? (
            <EmailStep
              email={email} setEmail={setEmail}
              busy={busy} error={error} info={info}
              onSubmit={onRequestOtp}
            />
          ) : (
            <CodeStep
              digits={digits} setDigits={setDigits}
              busy={busy} error={error} info={info}
              cooldown={cooldown}
              onSubmit={onVerifyOtp}
              onResend={onResend}
              onChangeEmail={() => {
                setStep("email"); setDigits(Array(CODE_LENGTH).fill(""));
                setError(null); setInfo(null);
              }}
            />
          )}

          <div style={{
            marginTop: 18, paddingTop: 14,
            borderTop: "1px solid var(--border-subtle)",
            fontSize: 11, color: "var(--text-muted)", lineHeight: 1.55,
          }}>
            We only send transactional sign-in emails. Your email stays private.
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Email step ───────────────────────────────────────────────────────────────
function EmailStep({
  email, setEmail, busy, error, info, onSubmit,
}: {
  email:    string;
  setEmail: (s: string) => void;
  busy:     boolean;
  error:    string | null;
  info:     string | null;
  onSubmit: (e?: React.FormEvent) => void | Promise<void>;
}) {
  return (
    <form onSubmit={onSubmit} noValidate>
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
        style={inputStyle(!!error)}
      />
      {error && <ErrorLine text={error} />}

      <PrimaryButton type="submit" busy={busy} disabled={busy || !email.trim()}>
        {busy ? "Sending code…" : "Email me a code"}
      </PrimaryButton>

      {info && <Notice text={info} />}
    </form>
  );
}

// ── Code step ────────────────────────────────────────────────────────────────
function CodeStep({
  digits, setDigits, busy, error, info, cooldown,
  onSubmit, onResend, onChangeEmail,
}: {
  digits:        string[];
  setDigits:     (d: string[]) => void;
  busy:          boolean;
  error:         string | null;
  info:          string | null;
  cooldown:      number;
  onSubmit:      (e?: React.FormEvent) => void | Promise<void>;
  onResend:      () => void | Promise<void>;
  onChangeEmail: () => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function setAt(idx: number, value: string) {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      setDigits(replaceAt(digits, idx, ""));
      return;
    }
    if (cleaned.length === 1) {
      setDigits(replaceAt(digits, idx, cleaned));
      const nextIdx = Math.min(CODE_LENGTH - 1, idx + 1);
      refs.current[nextIdx]?.focus();
      return;
    }
    const next = [...digits];
    for (let i = 0; i < cleaned.length && idx + i < CODE_LENGTH; i++) {
      next[idx + i] = cleaned[i];
    }
    setDigits(next);
    const filled = Math.min(CODE_LENGTH - 1, idx + cleaned.length);
    refs.current[filled]?.focus();
  }

  function onKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
      setDigits(replaceAt(digits, idx - 1, ""));
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      refs.current[idx - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowRight" && idx < CODE_LENGTH - 1) {
      refs.current[idx + 1]?.focus();
      e.preventDefault();
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < Math.min(text.length, CODE_LENGTH); i++) next[i] = text[i];
    setDigits(next);
    const filled = Math.min(CODE_LENGTH - 1, text.length - 1);
    refs.current[Math.max(0, filled)]?.focus();
  }

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldLabel>6-digit code</FieldLabel>
      <div className="otp-row">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={d}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={busy}
            aria-label={`Digit ${i + 1}`}
            className={"otp-digit" + (error ? " otp-digit--error" : "")}
          />
        ))}
      </div>
      {error && <ErrorLine text={error} />}

      <PrimaryButton type="submit" busy={busy} disabled={busy || digits.join("").length !== CODE_LENGTH}>
        {busy ? "Verifying…" : "Verify & sign in"}
      </PrimaryButton>

      <div style={{
        display: "flex", justifyContent: "space-between",
        gap: 8, marginTop: 12, fontSize: 12.5,
        flexWrap: "wrap",
      }}>
        <button
          type="button"
          onClick={onResend}
          disabled={busy || cooldown > 0}
          style={ghostBtn(busy || cooldown > 0)}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
        <button
          type="button"
          onClick={onChangeEmail}
          disabled={busy}
          style={ghostBtn(busy)}
        >
          Change email
        </button>
      </div>

      {info && <Notice text={info} />}
    </form>
  );
}

// ── Decorative + structural sub-components ──────────────────────────────────
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

function ghostBtn(disabled: boolean): React.CSSProperties {
  return {
    background: "transparent",
    color: disabled ? "var(--text-dim)" : "var(--text-secondary)",
    border: "none",
    fontSize: 12, fontWeight: 600, fontFamily: "inherit",
    cursor: disabled ? "not-allowed" : "pointer",
    padding: 0,
    textDecoration: disabled ? "none" : "underline",
    textDecorationColor: "var(--border)", textUnderlineOffset: 4,
  };
}

function ErrorLine({ text }: { text: string }) {
  return (
    <div style={{ marginTop: 7, fontSize: 12, color: "#fca5a5", display: "flex", alignItems: "center", gap: 6 }}>
      <span aria-hidden>⚠</span>
      {text}
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div style={{
      marginTop: 12,
      background: "#3730a31f",
      border: "1px solid #6366f155",
      color:  "#c7d2fe",
      borderRadius: 9, padding: "9px 11px", fontSize: 12, lineHeight: 1.5,
    }}>
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

function replaceAt(arr: string[], idx: number, value: string): string[] {
  const next = [...arr];
  next[idx] = value;
  return next;
}
