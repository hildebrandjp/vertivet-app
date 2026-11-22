import type { ComponentType, ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Alert.module.css";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CloseIcon,
  type IconProps,
  InfoIcon,
  XCircleIcon,
} from "./icons";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONE_ICONS: Record<AlertTone, ComponentType<IconProps>> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
  danger: XCircleIcon,
};

export interface AlertProps {
  tone?: AlertTone;
  /**
   * banner = tinted, bordered, uppercase title (form feedback);
   * callout = soft panel with sentence-case title (inline guidance).
   */
  variant?: "banner" | "callout";
  /** Short uppercase heading, e.g. "Invalid login attempt". */
  title?: ReactNode;
  children?: ReactNode;
  /** Replace the tone icon; pass `null` to hide it. */
  icon?: ReactNode;
  /** Renders a close button when provided. */
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
}

/**
 * Inline feedback. Banners are live regions: danger/warning use
 * role="alert" (announced immediately), info/success role="status".
 * Callouts are static guidance, so they are not announced.
 */
export function Alert({
  tone = "info",
  variant = "banner",
  title,
  children,
  icon,
  onDismiss,
  dismissLabel = "Dismiss",
  className,
}: AlertProps) {
  const ToneIcon = TONE_ICONS[tone];
  const urgent = tone === "danger" || tone === "warning";
  const role = variant === "callout" ? undefined : urgent ? "alert" : "status";

  return (
    <div
      role={role}
      data-tone={tone}
      data-variant={variant}
      className={cx(styles.alert, className)}
    >
      {icon === null ? null : (
        <span className={styles.icon} aria-hidden="true">
          {icon ?? <ToneIcon />}
        </span>
      )}
      <div className={styles.content}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.message}>{children}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className={styles.dismiss}
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}
