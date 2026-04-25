// ── Form scaffolding ──────────────────────────────────────────────────────────
// Shared chrome for all submission/profile pages: scrollable container, title,
// optional subtitle, posting-as chip, two-column field grid and sticky footer.

import type { CSSProperties, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

export function FormShell({
  title, subtitle, children, isMobile, backLabel, backHref,
}: {
  title:      string;
  subtitle?:  string;
  children:   ReactNode;
  isMobile:   boolean;
  /** Label for the back button, e.g. "Back to Readings" */
  backLabel?: string;
  /** If provided, back button links here; otherwise calls navigate(-1) */
  backHref?:  string;
}) {
  const navigate = useNavigate();
  return (
    <div style={{
      flex: 1, overflowY: "auto",
      padding: isMobile ? "16px 14px 96px" : "24px 28px 96px",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {backLabel && (
          backHref
            ? (
              <Link
                to={backHref}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
                  textDecoration: "none", marginBottom: 16,
                  letterSpacing: 0.3,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                ← {backLabel}
              </Link>
            )
            : (
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 600, color: "var(--text-muted)",
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, marginBottom: 16, fontFamily: "inherit",
                  letterSpacing: 0.3,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                ← {backLabel}
              </button>
            )
        )}
        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "var(--text-heading)", marginBottom: 6, letterSpacing: -0.3 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 18 }}>
            {subtitle}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
  textTransform: "uppercase", color: "var(--text-muted)",
  marginBottom: 5,
};

const inputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "10px 12px", fontSize: 13,
  color: "var(--text-bright)", fontFamily: "inherit",
  outline: "none", transition: "border-color 0.15s",
};

export function Field({
  label, hint, error, children, span,
}: {
  label: string; hint?: string; error?: string; children: ReactNode;
  /** "full" forces this field to span both columns inside a FieldGrid */
  span?: "full" | "half";
}) {
  return (
    <div style={{
      marginBottom: 14,
      gridColumn: span === "full" ? "1 / -1" : undefined,
    }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error
        ? <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{error}</div>
        : hint
          ? <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>
          : null}
    </div>
  );
}

export const fieldInput = inputStyle;

/** Two-column grid on desktop, single column on mobile. Drop <Field>s inside. */
export function FieldGrid({
  isMobile, children,
}: {
  isMobile: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      columnGap: 14,
    }}>
      {children}
    </div>
  );
}

/** Sticky bottom action bar that stays in view on long forms. */
export function FormFooter({ children, isMobile }: { children: ReactNode; isMobile: boolean }) {
  return (
    <div style={{
      position: "sticky", bottom: 0,
      marginTop: 16,
      marginInline: isMobile ? -14 : -24,
      padding: isMobile ? "10px 14px" : "12px 24px",
      background: "var(--bg-page)",
      borderTop: "1px solid var(--border-subtle)",
      display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center",
      flexWrap: "wrap",
    }}>
      {children}
    </div>
  );
}

export function FormButton({
  primary = false, type = "button", disabled, onClick, children,
}: {
  primary?: boolean;
  type?:    "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        background:  primary ? (disabled ? "#6366f155" : "#6366f1") : "transparent",
        color:       primary ? "#fff" : "var(--text-secondary)",
        border:      "1px solid " + (primary ? "#6366f1" : "var(--border)"),
        borderRadius: 8,
        padding: "9px 20px",
        fontSize: 13, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

/** Compact "posting as <name>" identity chip shown above the form. */
export function PostingAs({
  displayName, email, github,
}: {
  displayName?: string;
  email?:       string;
  github?:      string | null;
}) {
  const initial = (displayName || email || "U").trim().slice(0, 1).toUpperCase();
  const ghSafe  = (github ?? "").trim();
  const name    = displayName?.trim() || email || "you";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: 12, borderRadius: 10,
      background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
      marginBottom: 18,
    }}>
      {ghSafe ? (
        <img
          src={`https://github.com/${ghSafe}.png?size=80`}
          alt=""
          width={36}
          height={36}
          style={{ borderRadius: "50%", flexShrink: 0, background: "var(--bg-secondary)" }}
        />
      ) : (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", display: "grid", placeItems: "center",
          fontWeight: 800, fontSize: 14, flexShrink: 0,
        }}>
          {initial}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)" }}>
          Posting as
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-bright)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
          {ghSafe && (
            <span style={{ marginLeft: 8, fontSize: 11.5, fontWeight: 500, color: "var(--text-secondary)" }}>
              @{ghSafe}
            </span>
          )}
        </div>
      </div>
      <Link
        to="/app/profile"
        style={{
          fontSize: 11.5, fontWeight: 600,
          color: "#a5b4fc", textDecoration: "none",
          border: "1px solid #6366f155", borderRadius: 6,
          padding: "5px 10px", whiteSpace: "nowrap",
        }}
      >
        Edit profile
      </Link>
    </div>
  );
}
