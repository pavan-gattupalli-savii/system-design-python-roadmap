import { useOutletContext } from "react-router-dom";
import { InterviewTab } from "../components/InterviewTab";
import type { LayoutContext } from "../components/Layout";

export default function InterviewPage() {
  const ctx = useOutletContext<LayoutContext>();
  return <InterviewTab isMobile={ctx.isMobile} />;
}
