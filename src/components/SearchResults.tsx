import { useMemo } from "react";
import { sessionColors } from "../utils/stats";
import { ResourceCard } from "./ResourceCard";
import type { Phase } from "../data/models";

interface Props {
  roadmap: Phase[];
  query: string;
  onJumpToWeek: (ph: number, wn: number) => void;
  isMobile: boolean;
  completed: Set<string>;
  toggle: (id: string) => void;
}

export function SearchResults({ roadmap, query, onJumpToWeek, isMobile, completed, toggle }: Props) {
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const found = [];
    roadmap.forEach((p) => {
      p.weeks.forEach((w) => {
        w.sessions.forEach((s, si) => {
          const sessionHit = s.focus.toLowerCase().includes(q) || w.title.toLowerCase().includes(q);
          s.resources.forEach((r, ri) => {
            if (sessionHit || r.item.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.where.toLowerCase().includes(q)) {
              found.push({ p, w, s, si, r, ri });
            }
          });
        });
      });
    });
    return found;
  }, [query, roadmap]);

  if (!query.trim()) return null;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "20px 28px" }}>
      <div style={{ marginBottom: 14, color: "#64748b", fontSize: 12 }}>
        <span style={{ color: results.length > 0 ? "#6ee7b7" : "#f87171" }}>
          {results.length} result{results.length !== 1 ? "s" : ""}
        </span>
        {" "}for <span style={{ color: "#e2e8f0" }}>"{query}"</span>
      </div>

      {results.length === 0 ? (
        <div style={{ color: "#374151", fontSize: 13 }}>
          No matches. Try broad terms like "Redis", "Kafka", "SOLID", "auth", "docker"…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {results.map(({ p, w, s, si, r, ri }, i) => (
            <div key={i} style={{ background: "#0d1117", border: "1px solid #1c2430", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", background: "#090e16", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, color: p.accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
                  {p.icon} Ph{p.phase} · Wk {w.n}
                </span>
                <span style={{ fontSize: 11, color: "#4b5563" }}>·</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{w.title}</span>
                <span style={{ fontSize: 11, color: "#4b5563" }}>·</span>
                <span style={{ fontSize: 11, color: sessionColors(s.label).color, fontStyle: "italic" }}>{s.focus}</span>
                <button
                  className="jump-btn"
                  onClick={() => onJumpToWeek(p.phase, w.n)}
                  style={{ background: p.accent + "20", border: "1px solid " + p.accent + "40", color: p.light }}
                >
                  Go to week →
                </button>
              </div>
              <div style={{ padding: "8px 14px 12px" }}>
                <ResourceCard
                  phase={p.phase} weekN={w.n} si={si} ri={ri}
                  res={r} completed={completed} toggle={toggle} isMobile={isMobile}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
