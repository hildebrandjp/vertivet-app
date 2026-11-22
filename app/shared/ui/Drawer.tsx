"use client";

import { type ReactNode, useId } from "react";
import { useModalDialog } from "../hooks/useModalDialog";
import { cx } from "../utils/cx";
import { IconButton } from "./Button";
import styles from "./Drawer.module.css";
import { CloseIcon } from "./icons";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** Highlighted line under the title, e.g. "Luna · Labrador Retriever". */
  subtitle?: ReactNode;
  children?: ReactNode;
  /** Sticky actions at the bottom. */
  footer?: ReactNode;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  closeOnBackdropClick?: boolean;
  className?: string;
}

/** Side panel (13 Drawer) on a native modal <dialog>. */
export function Drawer({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  side = "right",
  size = "md",
  closeOnBackdropClick = true,
  className,
}: DrawerProps) {
  const ref = useModalDialog({ open, onOpenChange, closeOnBackdropClick });
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      data-side={side}
      data-size={size}
      className={cx(styles.drawer, className)}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headings}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          <IconButton
            size="sm"
            label="Close"
            icon={<CloseIcon />}
            onClick={() => onOpenChange(false)}
          />
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  );
}
