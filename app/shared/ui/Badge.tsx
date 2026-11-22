import type { ComponentPropsWithRef } from "react";
import type { Tone } from "../common";
import { cx } from "../utils/cx";
import styles from "./Badge.module.css";

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
  /** Colour intent: primary = confirmed, accent = pending, neutral = inactive. */
  tone?: Tone;
  /** solid = filled, soft = tinted background, outline = border only. */
  variant?: "solid" | "soft" | "outline";
  size?: "sm" | "md";
  /** Leading status dot. */
  dot?: boolean;
}

/** Status indicator (07 Badge). */
export function Badge({
  tone = "primary",
  variant = "solid",
  size = "md",
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      {...rest}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      className={cx(styles.badge, className)}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
