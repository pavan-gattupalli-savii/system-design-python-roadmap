// ── Frontend zod schemas (mirror the server) ─────────────────────────────────
// Used by the submission forms to surface validation errors before the round
// trip and again on the server for defence in depth.

import { z } from "zod";

const trim = (s: string) => s.trim();

const httpsUrl = z
  .string()
  .min(1, "URL is required")
  .max(2048)
  .transform(trim)
  .refine((u) => u.startsWith("https://"), { message: "URL must start with https://" })
  .refine((u) => { try { new URL(u); return true; } catch { return false; } }, "URL is malformed");

const tag = z.string().max(64).transform(trim).refine((s) => s.length > 0, "Empty tag");
const tags = z.array(tag).max(20);

export const readingForm = z.object({
  type:       z.string().min(1, "Type is required").max(40),
  title:      z.string().min(2, "Title is too short").max(200),
  url:        httpsUrl,
  topics:     tags.min(1, "At least one topic is required"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  notes:      z.string().max(500).optional().or(z.literal("")),
});
export type ReadingForm = z.infer<typeof readingForm>;

export const interviewForm = z.object({
  category:   z.string().min(1, "Category is required").max(40),
  title:      z.string().min(2, "Question is too short").max(280),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  companies:  z.array(z.string().max(80)).max(20).default([]),
  topics:     tags.default([]),
  hints:      z.array(z.string().min(1).max(500)).min(1, "Add at least one hint").max(20),
  followUps:  z.array(z.string().max(500)).max(20).default([]),
});
export type InterviewForm = z.infer<typeof interviewForm>;

export const experienceForm = z.object({
  title:    z.string().min(2, "Title is too short").max(200),
  url:      httpsUrl,
  platform: z.string().min(1, "Platform is required").max(40),
  company:  z.string().min(1, "Company is required").max(80),
  role:     z.string().min(1, "Role is required").max(80),
  outcome:  z.enum(["Offer", "Rejected", "Ongoing", "Unknown"]).optional(),
  topics:   tags.default([]),
  notes:    z.string().max(800).optional().or(z.literal("")),
});
export type ExperienceForm = z.infer<typeof experienceForm>;

export const answerDocForm = z.object({
  label: z.string().min(2, "Label is too short").max(120),
  url:   httpsUrl,
});
export type AnswerDocForm = z.infer<typeof answerDocForm>;

export const profileForm = z.object({
  displayName: z.string().min(1).max(80),
  github:      z.string().max(80).optional().or(z.literal("")),
  linkedin:    z.string().max(120).optional().or(z.literal("")),
});
export type ProfileForm = z.infer<typeof profileForm>;
