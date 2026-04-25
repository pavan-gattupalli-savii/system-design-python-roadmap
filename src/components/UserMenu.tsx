// ── User menu (avatar + dropdown) ─────────────────────────────────────────────
// Tiny in-house replacement for Stack's <UserButton/>. Initials avatar
// → dropdown with My profile, Admin (when applicable), Sign out.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  authKeys,
  signOut,
  useAuth,
  type AuthUser,
} from "../lib/auth";

function initialsOf(user: AuthUser): string {
  const base = user.displayName?.trim() || user.email;
  const tokens = base.split(/[\s@._-]+/).filter(Boolean);
  if (tokens.length === 0) return "?";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}

export function UserMenu({ compact }: { compact: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown",   onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown",   onEsc);
    };
  }, [open]);

  if (!user) return null;

  async function onSignOut() {
    setOpen(false);
    try {
      await signOut();
    } finally {
      // Reset every cached query — including auth + per-user data.
      qc.clear();
      qc.setQueryData(authKeys.me, null);
      navigate("/", { replace: true });
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={user.email}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 999, padding: compact ? 3 : "3px 10px 3px 3px",
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {initialsOf(user)}
        </div>
        {!compact && (
          <div style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.displayName || user.email}
          </div>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          minWidth: 220, background: "var(--bg-panel)",
          border: "1px solid var(--border)", borderRadius: 10,
          boxShadow: "0 10px 24px rgba(0,0,0,0.25)", zIndex: 50,
          padding: 6, fontFamily: "inherit",
        }}>
          <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.displayName || user.email.split("@")[0]}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          </div>
          <MenuItem onClick={() => { setOpen(false); navigate("/app/me"); }}>My profile</MenuItem>
          {user.role === "admin" && (
            <MenuItem onClick={() => { setOpen(false); navigate("/app/admin"); }} accent="#f59e0b">
              Admin queue
            </MenuItem>
          )}
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
          <MenuItem onClick={onSignOut} accent="#f87171">Sign out</MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  children, onClick, accent,
}: {
  children: React.ReactNode;
  onClick:  () => void;
  accent?:  string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%",
        background: "transparent", border: "none", textAlign: "left",
        padding: "8px 10px", borderRadius: 6,
        fontSize: 12.5, color: accent ?? "var(--text-body)",
        cursor: "pointer", fontFamily: "inherit",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}
