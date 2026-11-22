import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Breadcrumb.module.css";
import { ChevronRightIcon } from "./icons";

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current page (the last item). */
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  "aria-label"?: string;
  className?: string;
}

/** Navigation path (05 Breadcrumb). The last item is the current page. */
export function Breadcrumb({
  items,
  separator = <ChevronRightIcon />,
  "aria-label": ariaLabel = "Breadcrumb",
  className,
}: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} className={cx(styles.breadcrumb, className)}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li
              key={`${item.label}|${item.href ?? ""}`}
              className={styles.item}
            >
              {isCurrent ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.text}>{item.label}</span>
              )}
              {isCurrent ? null : (
                <span className={styles.separator} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
