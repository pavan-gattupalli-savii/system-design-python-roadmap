// ── First-run onboarding modal ─────────────────────────────────────────────
// Shown once when neither sd-theme nor sd-lang have been saved to localStorage.
// Asks the user to pick their preferred theme and language, then persists both.

import { useState } from "react";
import type { Language } from "../data/roadmap-index";
import { FONT_STACK } from "../constants/theme";

interface Props {
  onDone: (theme: "dark" | "light", lang: Language) => void;
}

const LANG_OPTIONS: { id: Language; label: string; icon: string; desc: string }[] = [
  { id: "python", label: "Python", icon: "🐍", desc: "Data engineering, ML pipelines, backend services" },
  { id: "java",   label: "Java",   icon: "☕", desc: "Enterprise backends, Spring, distributed systems" },
];

const THEME_OPTIONS: { id: "dark" | "light"; label: string; icon: string }[] = [
  { id: "dark",  label: "Dark",  icon: "🌙" },
  { id: "light", label: "Light", icon: "☀️" },
];

export default function OnboardingModal({ onDone }: Props) {
  const [step,  setStep]  = useState<"theme" | "lang">("theme");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang,  setLang]  = useState<Language>("python");

  const isDark = theme === "dark";

  // Inline palette that works before the theme is applied to <html>
  const bg      = isDark ? "#0d1117" : "#ffffff";
  const pageBg  = isDark ? "#060a10" : "#f1f5f9";
  const border  = isDark ? "#1c2430" : "#e2e8f0";
  const text     = isDark ? "#c9d8e8" : "#334155";
  const heading  = isDark ? "#f0f6ff" : "#0f172a";
  const muted    = isDark ? "#64748b" : "#94a3b8";
  const accent   = "#6366f1";
  const cardBg   = isDark ? "#111827" : "#f8fafc";

  function optionStyle(selected: boolean): React.CSSProperties {
    return {
      flex: 1,
      padding: "14px 16px",
      borderRadius: 10,
      border: `2px solid ${selected ? accent : border}`,
      background: selected ? (isDark ? "#1a1e2e" : "#ede9fe") : cardBg,
      cursor: "pointer",
      textAlign: "center" as const,
      transition: "border-color 0.15s, background 0.15s",
      outline: "none",
      fontFamily: FONT_STACK,
    };
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.72)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
      fontFamily: FONT_STACK,
    }}>
      <div style={{
        background: bg, borderRadius: 16, border: `1px solid ${border}`,
        padding: "32px 28px", maxWidth: 440, width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {(["theme", "lang"] as const).map((s) => (
            <div key={s} style={{
              height: 3, flex: 1, borderRadius: 2,
              background: step === s || (s === "theme") ? accent : border,
              opacity: s === "lang" && step === "theme" ? 0.3 : 1,
              transition: "opacity 0.2s",
            }} />
          ))}
        </div>

        {step === "theme" && (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: heading, marginBottom: 6 }}>
              Welcome 👋
            </div>
            <div style={{ fontSize: 14, color: muted, marginBottom: 24 }}>
              Let's set up your workspace. How do you like your interface?
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  style={optionStyle(theme === t.id)}
                  onClick={() => setTheme(t.id)}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: heading }}>{t.label}</div>
                </button>
              ))}
            </div>

            {/* Live preview strip */}
            <div style={{
              background: pageBg, borderRadius: 8, border: `1px solid ${border}`,
              padding: "10px 14px", marginBottom: 24, fontSize: 12, color: text,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: accent }} />
              Preview: {theme === "dark" ? "Dark workspace" : "Light workspace"}
            </div>

            <button
              onClick={() => setStep("lang")}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 8,
                background: accent, color: "#fff", border: "none",
                fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT_STACK,
              }}
            >
              Next →
            </button>
          </>
        )}

        {step === "lang" && (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: heading, marginBottom: 6 }}>
              Choose your language
            </div>
            <div style={{ fontSize: 14, color: muted, marginBottom: 24 }}>
              Pick your primary focus. You can switch anytime from the header.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {LANG_OPTIONS.map((l) => (
                <button
                  key={l.id}
                  style={{ ...optionStyle(lang === l.id), textAlign: "left", display: "flex", alignItems: "center", gap: 14 }}
                  onClick={() => setLang(l.id)}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: heading }}>{l.label}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{l.desc}</div>
                  </div>
                  {lang === l.id && (
                    <span style={{ marginLeft: "auto", color: accent, fontSize: 16 }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep("theme")}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 8,
                  background: "transparent", color: muted,
                  border: `1px solid ${border}`,
                  fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: FONT_STACK,
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => onDone(theme, lang)}
                style={{
                  flex: 2, padding: "12px 0", borderRadius: 8,
                  background: accent, color: "#fff", border: "none",
                  fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT_STACK,
                }}
              >
                Get started
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
