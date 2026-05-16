// ── Stats / Analytics dashboard ────────────────────────────────────────────────
// Surfaces per-user roadmap metrics: overall progress, mins spent + remaining,
// streak, velocity, type breakdown, and per-phase distribution.
// All numbers come from /api/me/analytics; no client-side aggregation.

import { useOutletContext } from "react-router-dom";
import { useAnalytics } from "../hooks/useAnalytics";
import { TYPES } from "../data/types";
import { useAuth } from "../lib/auth";
import type { LayoutContext } from "../components/Layout";

function fmtHours(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatPredicted(days: number | null): string {
  if (days === null) return "—";
  if (days <= 0) return "today";
  if (days < 7)  return `~${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) return `~${Math.round(days / 7)} weeks`;
  return `~${Math.round(days / 30)} months`;
}

export default function StatsPage() {
  const ctx = useOutletContext<LayoutContext>();
  const { user } = useAuth();
  const { analytics, isLoading } = useAnalytics(ctx.lang);

  if (!user) {
    return (
      <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-muted)", padding: 24 }}>
        Sign in to view your stats.
      </div>
    );
  }
  if (isLoading || !analytics) {
    return (
      <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
        Crunching numbers…
      </div>
    );
  }

  const { totals, mins, byType, byPhase, velocity, predictedDays, streak, lastCompletedAt } = analytics;
  const ACCENT = "#6366f1";
  const SUCCESS = ctx.isDark ? "#4ade80" : "#16a34a";

  const card = {
    background: "var(--bg-panel)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: ctx.isMobile ? "14px 16px" : "18px 20px",
  };
  const cardLabel = {
    fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" as const,
    color: "var(--text-muted)", fontWeight: 700, marginBottom: 6,
  };
  const cardValue = {
    fontSize: 26, fontWeight: 700, color: "var(--text-heading)", lineHeight: 1,
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: ctx.isMobile ? "16px" : "28px 36px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
          Your stats — {ctx.lang}
        </div>
        <h1 style={{ fontSize: 22, color: "var(--text-heading)", margin: "4px 0 0", fontWeight: 700 }}>
          Progress at a glance
        </h1>
      </div>

      {/* ── Top cards ─────────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gap: 12, marginBottom: 22,
        gridTemplateColumns: ctx.isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
      }}>
        <div style={card}>
          <div style={cardLabel}>Done</div>
          <div style={cardValue}>
            <span style={{ color: totals.pct === 100 ? SUCCESS : ACCENT }}>{totals.done}</span>
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}> / {totals.total}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{totals.pct}% complete</div>
        </div>

        <div style={card}>
          <div style={cardLabel}>Time invested</div>
          <div style={cardValue}>{fmtHours(mins.done)}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{fmtHours(mins.remaining)} to go</div>
        </div>

        <div style={card}>
          <div style={cardLabel}>Streak</div>
          <div style={{ ...cardValue, color: streak > 0 ? "#fbbf24" : "var(--text-heading)" }}>
            {streak} {streak === 1 ? "day" : "days"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            {lastCompletedAt ? `last: ${new Date(lastCompletedAt).toLocaleDateString()}` : "no completions yet"}
          </div>
        </div>

        <div style={card}>
          <div style={cardLabel}>Predicted finish</div>
          <div style={cardValue}>{formatPredicted(predictedDays)}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            at {velocity.perDay7.toFixed(1)}/day (7-day avg)
          </div>
        </div>
      </div>

      {/* ── Velocity strip ────────────────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 22 }}>
        <div style={cardLabel}>Velocity</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT }}>{velocity.last7d}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>resources / 7d</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT }}>{velocity.last30d}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>resources / 30d</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT }}>{velocity.perDay7.toFixed(1)}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>avg / day</div>
          </div>
        </div>
      </div>

      {/* ── Per-phase breakdown ──────────────────────────────────────────── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>
        Per phase
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
        {byPhase.map((p) => (
          <div key={p.phase} style={{
            background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 8,
            padding: "10px 14px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-heading)" }}>
                Phase {p.phase}: {p.title}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {p.done}/{p.total} · {fmtHours(p.mins)} / {fmtHours(p.totalMins)}
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
              <div style={{
                width: `${p.pct}%`,
                height: "100%",
                background: p.pct === 100 ? SUCCESS : ACCENT,
                transition: "width 0.35s ease",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Type breakdown ────────────────────────────────────────────────── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>
        By resource type
      </div>
      <div style={{
        display: "grid", gap: 8,
        gridTemplateColumns: ctx.isMobile ? "1fr" : "repeat(auto-fill, minmax(220px, 1fr))",
      }}>
        {Object.entries(byType)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([type, t]) => {
            const tc = TYPES[type] ?? TYPES["Article"];
            const pct = t.total ? Math.round((t.done / t.total) * 100) : 0;
            return (
              <div key={type} style={{
                background: tc.bg, border: "1px solid " + tc.tx + "33",
                borderRadius: 8, padding: "10px 12px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: tc.tx, fontWeight: 700 }}>
                    {tc.icon} {type}
                  </span>
                  <span style={{ fontSize: 11, color: tc.tx, fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ fontSize: 10, color: tc.tx, opacity: 0.85 }}>
                  {t.done}/{t.total} · {fmtHours(t.mins)} done
                </div>
                <div style={{ height: 3, borderRadius: 2, background: "#0008", overflow: "hidden", marginTop: 6 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: tc.tx }} />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
