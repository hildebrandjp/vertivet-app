"use client";

import { type ReactNode, useId } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";
import styles from "./Collapsible.module.css";
import { MinusIcon, PlusIcon } from "./icons";

export interface CollapsibleProps {
  title: ReactNode;
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Heading level wrapping the trigger, for document outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Content shown at the end of the header, before the +/− icon. */
  meta?: ReactNode;
  id?: string;
  className?: string;
}

/**
 * Single expandable section (19 Collapsible). Also the building block of
 * <AccordionItem>. Content animates open and is `inert` while closed.
 */
export function Collapsible({
  title,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  headingLevel = 3,
  meta,
  id,
  className,
}: CollapsibleProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const generatedId = useId();
  const baseId = id ?? `collapsible-${generatedId}`;
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;
  const Heading = `h${headingLevel}` as const;

  return (
    <div
      className={cx(styles.collapsible, className)}
      data-state={isOpen ? "open" : "closed"}
      data-disabled={disabled || undefined}
    >
      <Heading className={styles.heading}>
        <button
          type="button"
          id={triggerId}
          className={styles.trigger}
          aria-expanded={isOpen}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => setOpen(!isOpen)}
        >
          <span className={styles.title}>{title}</span>
          {meta != null ? <span className={styles.meta}>{meta}</span> : null}
          <span className={styles.icon} aria-hidden="true">
            {isOpen ? <MinusIcon /> : <PlusIcon />}
          </span>
        </button>
      </Heading>
      <section
        id={panelId}
        aria-labelledby={triggerId}
        className={styles.panel}
        inert={!isOpen}
      >
        <div className={styles.panelInner}>
          <div className={styles.content}>{children}</div>
        </div>
      </section>
    </div>
  );
}
