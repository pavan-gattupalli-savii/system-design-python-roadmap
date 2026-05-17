import { useOutletContext } from "react-router-dom";
import { InterviewTab } from "../components/InterviewTab";
import type { LayoutContext } from "../components/Layout";
import { useSeoMeta } from "../lib/seo";

export default function InterviewPage() {
  const ctx = useOutletContext<LayoutContext>();
  useSeoMeta({
    title: "System Design Interview Q&A + real experiences",
    description:
      "Practice real system design interview questions from Google, Amazon, Meta, Microsoft and more. Hints, follow-ups, community answer docs, and first-hand interview experiences.",
    canonical: "/app/interview",
  });
  return <InterviewTab isMobile={ctx.isMobile} />;
}
