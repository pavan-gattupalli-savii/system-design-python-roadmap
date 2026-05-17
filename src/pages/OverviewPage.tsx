// ── Overview page (formerly the Tracker tab) ─────────────────────────────────
import { useNavigate, useOutletContext } from "react-router-dom";
import { TrackerTab } from "../components/TrackerTab";
import { useRoadmap } from "../hooks/useRoadmap";
import { CHANNELS_BY_LANG } from "../constants/channels";
import type { LayoutContext } from "../components/Layout";
import { useSeoMeta } from "../lib/seo";

export default function OverviewPage() {
  const ctx = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const { phases: roadmap } = useRoadmap(ctx.lang);

  useSeoMeta({
    title: "Overview — your system design progress dashboard",
    description:
      "Track your progress across all 9 phases of the System Design Mastery Roadmap. Phase-by-phase completion, weekly stats, and a curated channel list per language.",
    canonical: "/app/overview",
  });

  return (
    <TrackerTab
      roadmap={roadmap}
      channels={CHANNELS_BY_LANG[ctx.lang]}
      completed={ctx.completed}
      reset={ctx.resetCompleted}
      isMobile={ctx.isMobile}
      isDark={ctx.isDark}
      onNavigateToPhase={(ph) => {
        const first = roadmap.find((p) => p.phase === ph)?.weeks[0]?.n ?? 1;
        navigate(`/app/roadmap/phase/${ph}/week/${first}`);
      }}
    />
  );
}
