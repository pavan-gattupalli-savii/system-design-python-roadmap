// ── Shared zod request schemas ────────────────────────────────────────────────
// Used by submission routes for safe input validation. Each schema mirrors the
// existing DB constraints so an invalid request fails fast at the API layer.

import { z } from "zod";

const trim = (s: string) => s.trim();

const httpsUrl = z
  .string()
  .max(2048)
  .transform(trim)
  .refine((u) => u.startsWith("https://"), { message: "URL must start with https://" })
  .refine((u) => {
    try { new URL(u); return true; } catch { return false; }
  }, { message: "URL is malformed" });

const tag = z.string().max(64).transform(trim).refine((s) => s.length > 0, "Empty tag");

const tags = z.array(tag).max(20);

export const readingSubmitSchema = z.object({
  type:       z.string().min(1).max(40).transform(trim),
  title:      z.string().min(2).max(200).transform(trim),
  url:        httpsUrl,
  topics:     tags,
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  notes:      z.string().max(500).transform(trim).optional(),
});

export const interviewSubmitSchema = z.object({
  category:   z.string().min(1).max(40).transform(trim),
  title:      z.string().min(2).max(280).transform(trim),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  companies:  z.array(z.string().max(80).transform(trim)).max(20).default([]),
  topics:     tags.default([]),
  hints:      z.array(z.string().min(1).max(500).transform(trim)).min(1).max(20),
  followUps:  z.array(z.string().max(500).transform(trim)).max(20).optional().default([]),
});

export const answerDocSubmitSchema = z.object({
  label: z.string().min(1).max(140).transform(trim),
  url:   httpsUrl,
});

export const experienceSubmitSchema = z.object({
  title:    z.string().min(2).max(200).transform(trim),
  url:      httpsUrl,
  platform: z.string().min(1).max(40).transform(trim),
  company:  z.string().min(1).max(80).transform(trim),
  role:     z.string().min(1).max(80).transform(trim),
  outcome:  z.enum(["Offer", "Rejected", "Ongoing", "Unknown"]).optional(),
  topics:   tags.default([]),
  notes:    z.string().max(800).transform(trim).optional(),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(80).transform(trim).optional(),
  github:      z.string().max(80).transform(trim).optional().or(z.literal("")),
  linkedin:    z.string().max(120).transform(trim).optional().or(z.literal("")),
});

export const progressUpdateSchema = z.object({
  language:    z.enum(["python", "java"]),
  resourceKey: z.string().min(1).max(200).transform(trim),
  done:        z.boolean(),
});

export const practiceToggleSchema = z.object({
  questionId: z.number().int().positive(),
  done:       z.boolean(),
});

export const adminKindSchema = z.enum(["readings", "interviews", "experiences", "answers"]);

// ── Auth ─────────────────────────────────────────────────────────────────────
const emailField = z
  .string()
  .min(3)
  .max(254)
  .transform((s) => s.trim().toLowerCase())
  .refine((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), { message: "Invalid email" });

export const requestOtpSchema = z.object({
  email: emailField,
});

export const verifyOtpSchema = z.object({
  email: emailField,
  code:  z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});
