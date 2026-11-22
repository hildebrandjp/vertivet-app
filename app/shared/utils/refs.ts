import type { Ref, RefCallback } from "react";

/** Combines several refs (object or callback) into a single callback ref. */
export function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined | null>
): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }
  };
}
