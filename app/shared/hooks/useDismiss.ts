"use client";

import { type RefObject, useEffect, useRef } from "react";

export type DismissReason = "outside" | "escape";

/**
 * Calls `onDismiss` when the user presses Escape or presses the pointer
 * outside of `ref` while `enabled` is true. Used by popovers and menus.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  onDismiss: (reason: DismissReason) => void,
) {
  // Keep the latest callback without re-subscribing on every render.
  const callbackRef = useRef(onDismiss);
  useEffect(() => {
    callbackRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (ref.current?.contains(event.target as Node)) return;
      callbackRef.current("outside");
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      callbackRef.current("escape");
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, ref]);
}
