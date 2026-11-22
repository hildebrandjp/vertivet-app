import type { ReactNode } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import styles from "./booking.module.css";

interface WizardFooterProps {
  /** Secondary action on the left (Cancel / Back). */
  start: ReactNode;
  /** Primary action on the right (Continue / Confirm). */
  end: ReactNode;
  /** Why the user can't continue yet. */
  error?: ReactNode;
}

/** Divider + action row shared by every booking step. */
export function WizardFooter({ start, end, error }: WizardFooterProps) {
  return (
    <div className={styles.footer}>
      {error ? <Alert tone="warning">{error}</Alert> : null}
      <div className={styles.footerActions}>
        {start}
        {end}
      </div>
    </div>
  );
}
