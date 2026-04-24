// ── ROADMAP REGISTRY ──────────────────────────────────────────────────────────
// Maps a language ID to its Phase[] data.
// Import ROADMAPS and index by Language to get the active roadmap.
import { pythonRoadmap } from "./roadmap-python";
import { javaRoadmap }   from "./roadmap-java";
import type { Phase }    from "./models";

export type Language = "python" | "java";

export const ROADMAPS: Record<Language, Phase[]> = {
  python: pythonRoadmap,
  java:   javaRoadmap,
};
