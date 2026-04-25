import { useOutletContext } from "react-router-dom";
import { ReadingsTab } from "../components/ReadingsTab";
import type { LayoutContext } from "../components/Layout";

export default function ReadingsPage() {
  const ctx = useOutletContext<LayoutContext>();
  return <ReadingsTab isMobile={ctx.isMobile} />;
}
