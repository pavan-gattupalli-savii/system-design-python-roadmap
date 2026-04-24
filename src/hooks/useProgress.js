import { useState, useCallback } from "react";
import { STORAGE_KEY } from "../constants/app";

// Manages per-resource completion state backed by localStorage.
// TypeScript migration: return type → { completed: Set<string>; toggle(id: string): void; reset(): void }
export function useProgress() {
  const [completed, setCompleted] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback((id) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCompleted(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { completed, toggle, reset };
}
