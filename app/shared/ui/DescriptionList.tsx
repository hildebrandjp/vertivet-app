import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./DescriptionList.module.css";

export interface DescriptionItem {
  term: string;
  details: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** inline = term and details side by side; stacked = details below term. */
  layout?: "inline" | "stacked";
  className?: string;
}

/** Key/value pairs, e.g. Owner / Age / Weight in a patient record. */
export function DescriptionList({
  items,
  layout = "inline",
  className,
}: DescriptionListProps) {
  return (
    <dl className={cx(styles.list, className)} data-layout={layout}>
      {items.map((item) => (
        <div key={item.term} className={styles.row}>
          <dt className={styles.term}>{item.term}</dt>
          <dd className={styles.details}>{item.details}</dd>
        </div>
      ))}
    </dl>
  );
}
