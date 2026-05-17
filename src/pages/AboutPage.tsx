import { useOutletContext } from "react-router-dom";
import { AboutTab } from "../components/AboutTab";
import type { LayoutContext } from "../components/Layout";
import { useSeoMeta } from "../lib/seo";

export default function AboutPage() {
  const ctx = useOutletContext<LayoutContext>();
  useSeoMeta({
    title: "About the roadmap — how it's built and how to use it",
    description:
      "Built by Pavan Kumar to go from Python/Java developer to system-design-ready engineer. Open source, free, admin-reviewed community submissions, and a 9-phase curriculum.",
    canonical: "/app/about",
  });
  return <AboutTab isMobile={ctx.isMobile} />;
}
