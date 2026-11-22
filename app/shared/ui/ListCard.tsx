import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import { ChevronRightIcon } from "./icons";
import styles from "./ListCard.module.css";

export interface ListCardProps {
  href: string;
  title: ReactNode;
  description?: ReactNode;
  /** Leading visual, usually an <Avatar>. */
  media?: ReactNode;
  /** Trailing content; defaults to a chevron. Pass null to hide. */
  trailing?: ReactNode;
  className?: string;
}

/** Whole-card link row: media, title, description and a chevron. */
export function ListCard({
  href,
  title,
  description,
  media,
  trailing,
  className,
}: ListCardProps) {
  return (
    <Link href={href} className={cx(styles.card, className)}>
      {media ? <span className={styles.media}>{media}</span> : null}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description ? (
          <span className={styles.description}>{description}</span>
        ) : null}
      </span>
      {trailing === undefined ? (
        <ChevronRightIcon className={styles.chevron} />
      ) : (
        trailing
      )}
    </Link>
  );
}

/** Vertical stack of ListCards with consistent spacing. */
export function ListCardGroup({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <ul className={styles.group} aria-label={label}>
      {children}
    </ul>
  );
}
