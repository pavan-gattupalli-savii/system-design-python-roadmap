import { useOutletContext } from "react-router-dom";
import { ReadingsTab } from "../components/ReadingsTab";
import type { LayoutContext } from "../components/Layout";
import { useSeoMeta } from "../lib/seo";

export default function ReadingsPage() {
  const ctx = useOutletContext<LayoutContext>();
  useSeoMeta({
    title: "Reading List — curated system design articles, videos & papers",
    description:
      "Community-curated, admin-reviewed system design reading list: foundational articles, distributed systems papers, talks and videos. Filter by post type, difficulty and topic.",
    canonical: "/app/readings",
  });
  return <ReadingsTab isMobile={ctx.isMobile} />;
}
