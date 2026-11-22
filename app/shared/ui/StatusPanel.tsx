"use client";

import { type ComponentType, type ReactNode, useEffect, useRef } from "react";
import { cx } from "../utils/cx";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  type IconProps,
  InfoIcon,
  XCircleIcon,
} from "./icons";
import styles from "./StatusPanel.module.css";

export type StatusTone = "success" | "info" | "warning" | "danger";

const TONE_ICONS: Record<StatusTone, ComponentType<IconProps>> = {
  success: CheckCircleIcon,
  info: InfoIcon,
  warning: AlertTriangleIcon,
  danger: XCircleIcon,
};

export interface StatusPanelProps {
  tone?: StatusTone;
  title: ReactNode;
  /** Explanation under the title. */
  children?: ReactNode;
  /** Buttons / links, stacked full width. */
  actions?: ReactNode;
  /** Replace the tone icon. */
  icon?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  /**
   * Move focus to the title on mount. Use when the panel replaces the
   * element that had focus (e.g. a submitted form) so keyboard and
   * screen-reader users land on the result.
   */
  autoFocus?: boolean;
  className?: string;
}

/** Centered result / empty state: icon, title, message and actions. */
export function StatusPanel({
  tone = "success",
  title,
  children,
  actions,
  icon,
  headingLevel = 2,
  autoFocus = false,
  className,
}: StatusPanelProps) {
  const ToneIcon = TONE_ICONS[tone];
  const Heading = `h${headingLevel}` as const;
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Mount-only: re-renders must not pull focus back.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally once.
  useEffect(() => {
    if (autoFocus) headingRef.current?.focus();
  }, []);

  return (
    <div className={cx(styles.panel, className)} data-tone={tone}>
      <span className={styles.icon} aria-hidden="true">
        {icon ?? <ToneIcon />}
      </span>
      <Heading
        className={styles.title}
        tabIndex={autoFocus ? -1 : undefined}
        ref={headingRef}
      >
        {title}
      </Heading>
      {children ? <div className={styles.message}>{children}</div> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
