// ── Phase Checkpoint page ─────────────────────────────────────────────────────
// Renders a multiple-choice quiz for a phase. Users select one option per
// question, click "Submit", and get per-question feedback + a pass/fail badge.

import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useCheckpoints } from "../hooks/useCheckpoints";
import { submitCheckpoint, type CheckpointResult } from "../api/checkpoints";
import { useRoadmap } from "../hooks/useRoadmap";
import { useAuth } from "../lib/auth";
import type { LayoutContext } from "../components/Layout";

export default function CheckpointPage() {
  const ctx = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const { p } = useParams<{ p?: string }>();
  const phase = p ? parseInt(p, 10) : 1;

  const { user } = useAuth();
  const { phases: roadmap } = useRoadmap(ctx.lang);
  const phaseMeta = roadmap.find((ph) => ph.phase === phase);
  const accent = phaseMeta?.accent ?? "#6366f1";

  const { questions, isLoading } = useCheckpoints(ctx.lang, phase);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [results, setResults] = useState<{ correct: number; total: number; passed: boolean; map: Map<number, CheckpointResult> } | null>(null);

  // Reset attempt on phase change
  useEffect(() => {
    setAnswers({});
    setResults(null);
    setSubmitError("");
  }, [phase, ctx.lang]);

  function pick(questionId: number, optionIdx: number) {
    if (results) return; // locked after submit
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  }

  async function handleSubmit() {
    if (!user) {
      navigate(`/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = questions
        .filter((q) => answers[q.id] !== undefined)
        .map((q) => ({ id: q.id, answer: answers[q.id] }));
      const resp = await submitCheckpoint(ctx.lang, phase, payload);
      const map = new Map<number, CheckpointResult>(resp.results.map((r) => [r.id, r]));
      setResults({ correct: resp.correct, total: resp.total, passed: resp.passed, map });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setAnswers({});
    setResults(null);
    setSubmitError("");
  }

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Loading checkpoint…
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ flex: 1, padding: 32, color: "var(--text-secondary)" }}>
        <button
          onClick={() => navigate(`/app/roadmap/phase/${phase}`)}
          style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}
        >
          ‹ Back to phase
        </button>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-heading)", marginBottom: 8 }}>
          No checkpoint authored for Phase {phase} ({ctx.lang}) yet.
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Check back later — content is being added phase by phase.
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: ctx.isMobile ? "16px" : "32px 40px", maxWidth: 880 }}>
      <button
        onClick={() => navigate(`/app/roadmap/phase/${phase}`)}
        style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}
      >
        ‹ Back to phase
      </button>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
          Phase {phase} Checkpoint
        </div>
        <h1 style={{ fontSize: 22, color: "var(--text-heading)", margin: "4px 0 6px", fontWeight: 700 }}>
          {phaseMeta?.title ?? `Phase ${phase}`} — quiz
        </h1>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {questions.length} question{questions.length === 1 ? "" : "s"}. Pick one option per question, then submit for grading.
        </div>
      </div>

      {/* Result banner */}
      {results && (
        <div style={{
          marginBottom: 18, padding: "12px 16px", borderRadius: 8,
          background:  results.passed ? "#4ade8014" : "#f87171" + "14",
          border:      "1px solid " + (results.passed ? "#4ade8055" : "#f8717155"),
          color:       results.passed ? "#4ade80" : "#f87171",
          fontSize: 13, fontWeight: 600,
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span>
            {results.passed ? "✅ Passed" : "❌ Some incorrect"} — {results.correct} / {results.total} correct
          </span>
          <button
            onClick={reset}
            style={{ background: "transparent", border: "1px solid currentColor", color: "inherit", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Retake
          </button>
        </div>
      )}

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {questions.map((q, qi) => {
          const picked = answers[q.id];
          const result = results?.map.get(q.id);
          const expected = result?.expected;
          return (
            <div key={q.id} style={{
              background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10,
              padding: ctx.isMobile ? "14px 14px" : "16px 18px",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{
                  fontSize: 10, color: accent, background: accent + "18", border: "1px solid " + accent + "44",
                  borderRadius: 5, padding: "2px 8px", fontWeight: 700, flexShrink: 0, marginTop: 2,
                }}>
                  Q{qi + 1}
                </span>
                <div style={{ fontSize: 13, color: "var(--text-heading)", lineHeight: 1.5, fontWeight: 600 }}>
                  {q.question}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 36 }}>
                {q.options.map((opt, i) => {
                  const isPicked = picked === i;
                  const isCorrect = result && expected === i;
                  const isWrongPick = result && isPicked && !result.correct;
                  let bg = "transparent";
                  let border = "1px solid var(--border)";
                  let color = "var(--text-body)";
                  if (results) {
                    if (isCorrect)        { bg = "#4ade8014"; border = "1px solid #4ade8055"; color = "#4ade80"; }
                    else if (isWrongPick) { bg = "#f8717114"; border = "1px solid #f8717155"; color = "#f87171"; }
                  } else if (isPicked) {
                    bg = accent + "18"; border = "1px solid " + accent; color = accent;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => pick(q.id, i)}
                      disabled={!!results}
                      style={{
                        textAlign: "left", background: bg, border, color, borderRadius: 6,
                        padding: "8px 12px", fontSize: 12, fontFamily: "inherit",
                        cursor: results ? "default" : "pointer", transition: "all 0.15s",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      <span style={{
                        width: 16, height: 16, borderRadius: "50%",
                        background: isPicked ? color : "transparent",
                        border: "1.5px solid " + (isPicked ? color : "var(--border-mid)"),
                        flexShrink: 0,
                      }} />
                      <span>{opt}</span>
                      {isCorrect && <span style={{ marginLeft: "auto", fontWeight: 700 }}>✓</span>}
                      {isWrongPick && <span style={{ marginLeft: "auto", fontWeight: 700 }}>✗</span>}
                    </button>
                  );
                })}
              </div>
              {result && result.explanation && (
                <div style={{
                  marginTop: 12, marginLeft: 36, padding: "10px 12px", borderRadius: 6,
                  background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                  fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6,
                }}>
                  <span style={{ color: "#fbbf24", marginRight: 4 }}>💡</span>
                  {result.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit bar */}
      {!results && (
        <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
            style={{
              background: allAnswered ? accent : "var(--bg-card)",
              color: allAnswered ? "#fff" : "var(--text-muted)",
              border: "none", borderRadius: 7, padding: "9px 22px",
              fontSize: 13, fontWeight: 700, fontFamily: "inherit",
              cursor: submitting || !allAnswered ? "default" : "pointer",
              opacity: submitting ? 0.6 : 1, transition: "all 0.15s",
            }}
          >
            {submitting ? "Grading…" : user ? "Submit answers" : "Sign in to submit"}
          </button>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {answeredCount}/{questions.length} answered
          </span>
          {submitError && (
            <span style={{ fontSize: 12, color: "#f87171" }}>{submitError}</span>
          )}
        </div>
      )}
    </div>
  );
}
