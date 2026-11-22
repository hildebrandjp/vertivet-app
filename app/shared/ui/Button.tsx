import Link from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type { Size } from "../common";
import { DEFAULT_SIZE } from "../size";
import { cx } from "../utils/cx";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "accent";

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: Size;
  /** Stretch to the width of the container. */
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export interface ButtonProps
  extends ButtonStyleProps,
    ComponentPropsWithRef<"button"> {
  /** Shows a spinner and disables the button. */
  loading?: boolean;
}

/** Button (06): primary, secondary, ghost, danger and accent actions. */
export function Button({
  variant = "primary",
  size = DEFAULT_SIZE,
  fullWidth = false,
  loading = false,
  startIcon,
  endIcon,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      className={cx(styles.button, className)}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        startIcon
      )}
      {children != null ? (
        <span className={styles.label}>{children}</span>
      ) : null}
      {endIcon}
    </button>
  );
}

export interface ButtonLinkProps
  extends ButtonStyleProps,
    Omit<ComponentPropsWithRef<typeof Link>, "children"> {
  children?: ReactNode;
}

/** A Next.js <Link> styled as a Button, for navigation actions. */
export function ButtonLink({
  variant = "primary",
  size = DEFAULT_SIZE,
  fullWidth = false,
  startIcon,
  endIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      {...rest}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      className={cx(styles.button, className)}
    >
      {startIcon}
      {children != null ? (
        <span className={styles.label}>{children}</span>
      ) : null}
      {endIcon}
    </Link>
  );
}

export interface IconButtonProps
  extends Omit<
    ButtonProps,
    "startIcon" | "endIcon" | "fullWidth" | "children"
  > {
  /** Accessible name; icon-only buttons must have one. */
  label: string;
  icon: ReactNode;
}

/** Square, icon-only button (close, navigation arrows, etc.). */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      {...rest}
      variant={variant}
      aria-label={label}
      title={label}
      startIcon={icon}
      className={cx(styles.iconOnly, className)}
    />
  );
}
