import { useState } from "react";
import type { MouseEvent } from "react";

/**
 * Manages a single resizable panel's pixel width, driven by a drag handle.
 * Attach `onDragStart` to a divider element's onMouseDown.
 *
 * @param initial - Starting width in pixels
 * @param min     - Minimum allowed width in pixels
 * @param max     - Maximum allowed width in pixels
 */
export function usePanelResize(initial: number, min: number, max: number) {
  const [width, setWidth] = useState(initial);

  function onDragStart(e: MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;

    function onMove(ev: globalThis.MouseEvent) {
      setWidth(Math.min(max, Math.max(min, startW + ev.clientX - startX)));
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return { width, onDragStart };
}
