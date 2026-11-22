"use client";

import { Button } from "@/app/shared/ui/Button";
import { StatusPanel } from "@/app/shared/ui/StatusPanel";
import styles from "./error.module.css";

/**
 * Error boundary for app pages. The shell (sidebar, topbar) stays usable;
 * `retry` re-fetches and re-renders the failed segment.
 */
export default function AppError({
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div className={styles.error}>
      <StatusPanel
        tone="danger"
        title="We couldn't load this page"
        autoFocus
        actions={<Button onClick={() => retry()}>Try again</Button>}
      >
        Something went wrong while fetching your clinic data. Check your
        connection and try again.
      </StatusPanel>
    </div>
  );
}
