// ── App Layout ────────────────────────────────────────────────────────────────
// Shared chrome around every authenticated/unauthenticated route under /app.
// Owns global UI state (theme, language, progress) and exposes it to nested
// routes via Outlet context.

import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import type { Language } from "../data/roadmap-index";
import { LANGUAGES, APP_TITLE, APP_SUBTITLE, TRACKER_URL } from "../constants/app";
import { FONT_STACK } from "../constants/theme";
import { useIsMobile } from "../hooks/useIsMobile";
import { useRoadmap } from "../hooks/useRoadmap";
import { useProgress } from "../hooks/useProgress";
import { getPhaseStats } from "../utils/stats";
import { useMyProfile } from "../hooks/useMyProfile";
import { useAuth } from "../lib/auth";
import { UserMenu } from "./UserMenu";
import OnboardingModal from "./OnboardingModal";

const APP_TABS = [
  { id: "overview",  label: "Overview",   path: "/app/overview"  },
  { id: "roadmap",   label: "Roadmap",    path: "/app/roadmap"   },
  { id: "readings",  label: "Readings",   path: "/app/readings"  },
  { id: "interview", label: "Interview",  path: "/app/interview" },
  { id: "about",     label: "About",      path: "/app/about"     },
] as const;

export interface LayoutContext {
  isMobile: boolean;
  isDark:   boolean;
  setIsDark: (v: boolean | ((d: boolean) => boolean)) => void;
  lang:     Language;
  setLang:  (l: Language) => void;
  completed: Set<string>;
  toggleCompleted: (key: string) => void;
  resetCompleted: () => void;
}

export default function Layout() {
  const isMobile  = useIsMobile();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [params, setParams] = useSearchParams();
  const { user }  = useAuth();
  const profile   = useMyProfile();
  const isAdmin   = user?.role === "admin";

  // Theme — persisted across sessions
  const [isDark, setIsDark] = useState(() => localStorage.getItem("sd-theme") !== "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("sd-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // First-run onboarding: show if neither preference has been saved yet
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("sd-theme") && !localStorage.getItem("sd-lang")
  );

  function handleOnboardingDone(theme: "dark" | "light", chosenLang: Language) {
    setIsDark(theme === "dark");
    setLang(chosenLang);
    setShowOnboarding(false);
  }

  // Language: read from ?lang=, fall back to localStorage, then default to "python"
  const lang = useMemo<Language>(() => {
    const fromUrl = params.get("lang");
    if (fromUrl === "python" || fromUrl === "java") return fromUrl;
    const stored = localStorage.getItem("sd-lang");
    return stored === "java" ? "java" : "python";
  }, [params]);

  function setLang(next: Language) {
    if (next === lang) return;
    localStorage.setItem("sd-lang", next);
    const newParams = new URLSearchParams(params);
    newParams.set("lang", next);
    setParams(newParams, { replace: true });
  }

  const langDef       = LANGUAGES.find((l) => l.id === lang)!;
  const activeRoadmap = useRoadmap(lang);
  const { completed, toggle: toggleCompleted, reset: resetCompleted } = useProgress(lang);

  const totalStats = useMemo(() => {
    let total = 0, done = 0;
    activeRoadmap.forEach((p) => {
      const s = getPhaseStats(p, completed);
      total += s.total;
      done  += s.done;
    });
    return { total, done };
  }, [completed, activeRoadmap]);

  // Compute which top-level tab is active from the URL.
  const activeTab = useMemo(() => {
    const seg = location.pathname.split("/").filter(Boolean);
    // /app/<tab>/...
    return seg[1] ?? "overview";
  }, [location.pathname]);

  const ctx: LayoutContext = {
    isMobile, isDark, setIsDark, lang, setLang,
    completed, toggleCompleted, resetCompleted,
  };

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", height: "100vh",
        background: "var(--bg-page)", color: "var(--text-body)",
        fontFamily: FONT_STACK, userSelect: "none",
      }}
    >
      {showOnboarding && (
        <OnboardingModal onDone={handleOnboardingDone} />
      )}
      <header
        style={{
          background: "var(--bg-panel)", borderBottom: "1px solid var(--border)",
          boxShadow: isDark ? "0 1px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
          padding: isMobile ? "10px 14px 0" : "12px 24px 0",
          flexShrink: 0, transition: "box-shadow 0.2s",
        }}
      >
        <div style={{
          display: "flex", alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between", gap: 12,
          marginBottom: isMobile ? 8 : 0, flexWrap: "wrap",
        }}>
          {/* Title — clicking returns to home */}
          <button
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "inherit" }}
          >
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800, color: "var(--text-heading)", letterSpacing: -0.3 }}>
              {APP_TITLE}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{APP_SUBTITLE}</div>
          </button>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Language switcher */}
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
              {LANGUAGES.map((l, idx) => {
                const active = lang === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => setLang(l.id as Language)}
                    title={"Switch to " + l.label + " roadmap"}
                    style={{
                      background:  active ? l.accent + "22" : "transparent",
                      border:      "none",
                      borderRight: idx < LANGUAGES.length - 1 ? "1px solid var(--border)" : "none",
                      padding:     isMobile ? "6px 10px" : "6px 14px",
                      fontSize:    isMobile ? 11 : 12,
                      color:       active ? l.color : "var(--text-dim)",
                      cursor:      "pointer", fontFamily: "inherit",
                      fontWeight:  active ? 700 : 400, transition: "all 0.15s",
                      whiteSpace:  "nowrap",
                    }}
                  >
                    {l.icon} {l.label}
                  </button>
                );
              })}
            </div>

            {/* Progress pill */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border-mid)",
              borderRadius: 6, padding: "5px 11px", fontSize: 11,
              color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            }}>
              <span style={{ color: totalStats.done > 0 ? langDef.color : "var(--text-muted)", fontWeight: 700 }}>
                {totalStats.done}
              </span>
              <span>/{totalStats.total} done</span>
            </div>

            <a href={TRACKER_URL} target="_blank" rel="noopener noreferrer" className="tracker-link">
              🔊 Tracker ↗
            </a>

            <button className="theme-toggle" onClick={() => setIsDark((d) => !d)}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Auth controls */}
            {user ? (
              <UserMenu compact={isMobile} />
            ) : (
              <button
                onClick={() => navigate(`/sign-in?next=${encodeURIComponent(location.pathname + location.search)}`)}
                style={{
                  background: "#6366f1", border: "1px solid #6366f1", color: "#fff",
                  borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: "flex", marginTop: isMobile ? 4 : 10, flexWrap: "wrap" }}>
          {APP_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <NavLink
                key={tab.id}
                to={tab.path + (params.has("lang") ? `?lang=${lang}` : "")}
                className="nav-tab"
                style={{
                  borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
                  padding: isMobile ? "8px 14px" : "10px 18px",
                  fontSize: 12,
                  color: active ? "#a5b4fc" : "var(--text-muted)",
                  fontWeight: active ? 600 : 400,
                  textDecoration: "none",
                }}
              >
                {tab.label}
              </NavLink>
            );
          })}
          {isAdmin && (
            <NavLink
              to="/app/admin"
              className="nav-tab"
              style={{
                borderBottom: activeTab === "admin" ? "2px solid #f59e0b" : "2px solid transparent",
                padding: isMobile ? "8px 14px" : "10px 18px",
                fontSize: 12,
                color: activeTab === "admin" ? "#fbbf24" : "var(--text-muted)",
                fontWeight: activeTab === "admin" ? 600 : 400,
                textDecoration: "none",
              }}
            >
              ⚡ Admin
              {profile.data && (profile.data.pending.readings + profile.data.pending.interviews + profile.data.pending.experiences + profile.data.pending.answers) > 0 && (
                <span style={{ marginLeft: 6, background: "#f59e0b", color: "#000", borderRadius: 9, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                  •
                </span>
              )}
            </NavLink>
          )}
        </nav>
      </header>

      <main style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        <Outlet context={ctx} />
      </main>
    </div>
  );
}
