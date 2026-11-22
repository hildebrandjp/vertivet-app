import type { CSSProperties } from "react";
import { cx } from "../utils/cx";
import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  /** Any CSS length. Defaults to 100%. */
  width?: string;
  /** Any CSS length. Defaults to 1em (text line). */
  height?: string;
  shape?: "line" | "rect" | "circle";
  className?: string;
  style?: CSSProperties;
}

/**
 * Placeholder shown while content streams in (Suspense fallbacks,
 * LazySection). Hidden from assistive tech; wrap groups with aria-busy.
 */
export function Skeleton({
  width,
  height,
  shape = "line",
  className,
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      data-shape={shape}
      className={cx(styles.skeleton, className)}
      style={{ width, height, ...style }}
    />
  );
}
