import { useState, useCallback, useEffect } from "react";

interface ProgressHook {
  completed: Set<string>;
  toggle: (id: string) => void;
  reset: () => void;
}

/** Manages per-resource completion state backed by sessionStorage.
 *  Pass a language-specific key so progress is tracked separately per language.
 *  Progress resets on page refresh — prevents confusion on shared devices.
 */
export function useProgress(storageKey: string): ProgressHook {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      return new Set<string>(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set<string>();
    }
  });

  // Re-load from sessionStorage whenever the language (storageKey) changes.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      setCompleted(new Set<string>(stored ? JSON.parse(stored) : []));
    } catch {
      setCompleted(new Set<string>());
    }
  }, [storageKey]);

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      sessionStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    setCompleted(new Set());
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return { completed, toggle, reset };
}
