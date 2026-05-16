// ── Checkpoints API ───────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { Language } from "../data/roadmap-index";

export interface CheckpointQuestion {
  id:       number;
  question: string;
  options:  string[];
}

export interface CheckpointResult {
  id:          number;
  correct:     boolean;
  expected:    number | null;
  explanation: string;
}

export interface CheckpointSubmissionResponse {
  total:   number;
  correct: number;
  passed:  boolean;
  results: CheckpointResult[];
}

export type PhaseCheckpointStatus = Record<number, { total: number; passed: number }>;

export async function fetchCheckpoints(language: Language, phase: number): Promise<CheckpointQuestion[]> {
  return apiFetch<CheckpointQuestion[]>(`/api/checkpoints/${language}/${phase}`);
}

export async function submitCheckpoint(
  language: Language,
  phase: number,
  answers: Array<{ id: number; answer: number }>,
): Promise<CheckpointSubmissionResponse> {
  return apiFetch(`/api/checkpoints/${language}/${phase}/submit`, {
    method: "POST",
    body:   JSON.stringify({ answers }),
  });
}

export async function fetchMyCheckpointStatus(language: Language): Promise<PhaseCheckpointStatus> {
  return apiFetch<PhaseCheckpointStatus>(`/api/checkpoints/${language}/me`);
}
