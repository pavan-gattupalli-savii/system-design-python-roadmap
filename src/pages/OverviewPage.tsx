// ── Overview page (formerly the Tracker tab) ─────────────────────────────────
import { useNavigate, useOutletContext } from "react-router-dom";
import { TrackerTab } from "../components/TrackerTab";
import { useRoadmap } from "../hooks/useRoadmap";
import { CHANNELS_BY_LANG } from "../constants/channels";
import type { LayoutContext } from "../components/Layout";

export default function OverviewPage() {
  const ctx = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const roadmap  = useRoadmap(ctx.lang);

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
