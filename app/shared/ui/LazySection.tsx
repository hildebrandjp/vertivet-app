"use client";

import type { ReactNode } from "react";
import { useInView } from "../hooks/useInView";
import { cx } from "../utils/cx";
import styles from "./LazySection.module.css";
import { Skeleton } from "./Skeleton";

export interface LazySectionProps {
  children: ReactNode;
  /** Space reserved before mount, avoids layout shift. Any CSS length. */
  minHeight?: string;
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
  /** Shown until the section is near the viewport. Defaults to a skeleton. */
  fallback?: ReactNode;
  className?: string;
}

/**
 * Mounts its children only when scrolled near. Pair it with `next/dynamic`
 * children so their JavaScript is fetched on demand too:
 *
 * const Reports = dynamic(() => import("./Reports"));
 * <LazySection minHeight="480px"><Reports /></LazySection>
 */
export function LazySection({
  children,
  minHeight = "320px",
  rootMargin,
  fallback,
  className,
}: LazySectionProps) {
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin });

  return (
    <div
      ref={ref}
      className={cx(styles.lazy, className)}
      style={inView ? undefined : { minHeight }}
    >
      {inView
        ? children
        : (fallback ?? <Skeleton shape="rect" height={minHeight} />)}
    </div>
  );
}
