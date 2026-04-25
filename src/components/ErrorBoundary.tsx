// ── Top-level error boundary ──────────────────────────────────────────────────
// Catches render-time exceptions inside the <App /> tree so a single broken
// component doesn't blow up the whole page.

import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  err: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", err, info);
  }

  reset = () => this.setState({ err: null });

  render() {
    if (!this.state.err) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh", display: "grid", placeItems: "center",
        background: "var(--bg-page, #0f172a)", color: "var(--text-body, #e2e8f0)",
        padding: 24, fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}>
        <div style={{
          maxWidth: 480, padding: 28, borderRadius: 12,
          background: "var(--bg-panel, #1e293b)",
          border: "1px solid var(--border, #334155)",
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "var(--text-heading, #f8fafc)" }}>
            Something went wrong.
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary, #cbd5e1)", lineHeight: 1.6, marginBottom: 18 }}>
            The page crashed before we could render it. Try reloading — if it keeps happening, the details below help us debug.
          </div>
          <pre style={{
            fontSize: 11, color: "#fca5a5", whiteSpace: "pre-wrap", margin: 0,
            background: "rgba(0,0,0,0.25)", padding: 10, borderRadius: 8,
            maxHeight: 180, overflow: "auto",
          }}>
            {this.state.err.message}
          </pre>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={this.reset} style={btn("transparent", "var(--text-secondary, #cbd5e1)")}>
              Try again
            </button>
            <button onClick={() => window.location.assign("/")} style={btn("#6366f1", "#fff", "#6366f1")}>
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function btn(bg: string, color: string, border?: string) {
  return {
    background: bg, color, border: `1px solid ${border ?? "var(--border, #334155)"}`,
    borderRadius: 8, padding: "8px 16px",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit",
  } as const;
}
