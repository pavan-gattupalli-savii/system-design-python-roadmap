import { useOutletContext } from "react-router-dom";
import { AboutTab } from "../components/AboutTab";
import type { LayoutContext } from "../components/Layout";

export default function AboutPage() {
  const ctx = useOutletContext<LayoutContext>();
  return <AboutTab isMobile={ctx.isMobile} />;
}
