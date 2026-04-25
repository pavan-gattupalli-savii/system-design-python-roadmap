// ── Bootstrap API ─────────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { Phase } from "../data/models";
import type { Reading } from "../data/readings";
import type { InterviewQ, InterviewExp } from "../data/interviews";

export interface BootstrapResponse {
  roadmap:     Phase[];
  readings:    Reading[];
  interviews:  InterviewQ[];
  experiences: InterviewExp[];
  language:    "python" | "java";
}

export async function fetchBootstrap(language: "python" | "java"): Promise<BootstrapResponse> {
  return apiFetch<BootstrapResponse>(`/api/bootstrap?lang=${language}`);
}
