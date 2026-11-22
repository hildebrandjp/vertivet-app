import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./SectionHeader.module.css";
import { Heading } from "./Typography";

export interface SectionHeaderProps {
  title: ReactNode;
  /** id for the heading, so the section can use aria-labelledby. */
  id?: string;
  description?: ReactNode;
  /** Buttons or menus aligned to the end ("View All", "···"). */
  actions?: ReactNode;
  /** 2 = page section (24px), 4 = panel heading (16px). */
  level?: 2 | 3 | 4;
  as?: "h2" | "h3" | "h4";
  className?: string;
}

/** Section title row with optional description and trailing actions. */
export function SectionHeader({
  title,
  id,
  description,
  actions,
  level = 2,
  as,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cx(styles.header, className)}>
      <div className={styles.text}>
        <Heading id={id} level={level} as={as ?? `h${level}`}>
          {title}
        </Heading>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
