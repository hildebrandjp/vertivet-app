import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Typography.module.css";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Visual level from the type scale:
   * 1 = page title (32 Bold), 2 = section (24 SemiBold),
   * 3 = card (18 SemiBold), 4 = sub-heading (16 SemiBold).
   */
  level?: 1 | 2 | 3 | 4;
  /** Rendered tag, when semantics differ from the visual level. */
  as?: HeadingTag;
}

/** Montserrat heading; navy for hierarchy. */
export function Heading({ level = 2, as, className, ...rest }: HeadingProps) {
  const Tag = as ?? (`h${level}` as HeadingTag);
  return (
    <Tag
      {...rest}
      data-level={level}
      className={cx(styles.heading, className)}
    />
  );
}

export type TextVariant = "body" | "supporting" | "label" | "small" | "eyebrow";
export type TextTone =
  | "default"
  | "muted"
  | "heading"
  | "primary"
  | "danger"
  | "success";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /**
   * body = 16 Regular, supporting = 14 Regular, label = 14 Medium,
   * small = 12 Medium, eyebrow = 12 Medium uppercase.
   */
  variant?: TextVariant;
  tone?: TextTone;
  as?: ElementType;
}

/** Inter body copy following the VertiVet type scale. */
export function Text({
  variant = "body",
  tone,
  as: Tag = "p",
  className,
  ...rest
}: TextProps) {
  return (
    <Tag
      {...rest}
      data-variant={variant}
      data-tone={tone}
      className={cx(styles.text, className)}
    />
  );
}

export interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  /** Small golden dot before the label (e.g. "● UPCOMING CARE"). */
  dot?: boolean;
  children: ReactNode;
}

/** Small uppercase label used above card titles. */
export function Eyebrow({
  dot = false,
  className,
  children,
  ...rest
}: EyebrowProps) {
  return (
    <span {...rest} className={cx(styles.eyebrow, className)}>
      {dot ? <span className={styles.eyebrowDot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
