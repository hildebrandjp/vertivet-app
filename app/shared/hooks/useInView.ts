"use client";

import { useEffect, useState } from "react";

interface UseInViewOptions {
  /** Start early so content is ready before it scrolls in. */
  rootMargin?: string;
  /** Stop observing after the first intersection (default). */
  once?: boolean;
}

/**
 * Tracks whether an element is (or is about to be) on screen.
 * Returns a callback ref to attach and the current visibility.
 * Falls back to "visible" where IntersectionObserver is unavailable.
 */
export function useInView<T extends Element>({
  rootMargin = "300px 0px",
  once = true,
}: UseInViewOptions = {}) {
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  const done = once && inView;

  useEffect(() => {
    if (!node || done) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, done, once, rootMargin]);

  return [setNode, inView] as const;
}
