import type { ComponentPropsWithRef } from "react";
import { cx } from "../utils/cx";
import styles from "./Card.module.css";
import { Heading, type HeadingProps } from "./Typography";

export interface CardProps extends ComponentPropsWithRef<"div"> {
  /** default = white card with border; muted = soft background panel. */
  variant?: "default" | "muted" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

/** White card / soft canvas / 1px border surface. */
export function Card({
  variant = "default",
  padding = "md",
  className,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      data-variant={variant}
      data-padding={padding}
      className={cx(styles.card, className)}
    />
  );
}

export interface CardHeaderProps extends ComponentPropsWithRef<"div"> {
  /** Draw a hairline under the header. */
  divider?: boolean;
}

export function CardHeader({
  divider = false,
  className,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      {...rest}
      data-divider={divider || undefined}
      className={cx(styles.header, className)}
    />
  );
}

export function CardTitle({ level = 3, ...rest }: HeadingProps) {
  return <Heading level={level} {...rest} />;
}

export function CardDescription({
  className,
  ...rest
}: ComponentPropsWithRef<"p">) {
  return <p {...rest} className={cx(styles.description, className)} />;
}

export function CardContent({
  className,
  ...rest
}: ComponentPropsWithRef<"div">) {
  return <div {...rest} className={cx(styles.content, className)} />;
}

export function CardFooter({
  className,
  ...rest
}: ComponentPropsWithRef<"div">) {
  return <div {...rest} className={cx(styles.footer, className)} />;
}
