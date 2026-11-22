import Link from "next/link";
import type { ComponentPropsWithRef } from "react";
import { cx } from "../utils/cx";
import styles from "./TextLink.module.css";

export interface TextLinkProps extends ComponentPropsWithRef<typeof Link> {
  /** primary = royal blue; muted = slate, turns blue on hover. */
  tone?: "primary" | "muted";
  size?: "xs" | "sm" | "md";
}

/** Inline text link built on next/link (prefetching, client navigation). */
export function TextLink({
  tone = "primary",
  size = "sm",
  className,
  ...rest
}: TextLinkProps) {
  return (
    <Link
      {...rest}
      data-tone={tone}
      data-size={size}
      className={cx(styles.link, className)}
    />
  );
}
