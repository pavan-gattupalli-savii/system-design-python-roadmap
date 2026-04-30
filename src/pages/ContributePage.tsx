import { useOutletContext } from "react-router-dom";
import { ContributeTab } from "../components/ContributeTab";
import type { LayoutContext } from "../components/Layout";

export default function ContributePage() {
  const ctx = useOutletContext<LayoutContext>();
  return <ContributeTab isMobile={ctx.isMobile} />;
}
