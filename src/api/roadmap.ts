// ── Roadmap API ───────────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { Phase } from "../data/models";

export async function fetchRoadmap(language: "python" | "java"): Promise<Phase[]> {
  return apiFetch<Phase[]>(`/api/roadmap/${language}`);
}
