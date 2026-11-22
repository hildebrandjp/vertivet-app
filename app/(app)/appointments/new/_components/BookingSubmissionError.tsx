import type { FormMessage } from "@/app/shared/forms/form-state";
import { Button } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import { AlertTriangleIcon } from "@/app/shared/ui/icons";
import { StatusPanel } from "@/app/shared/ui/StatusPanel";
import styles from "./review.module.css";

export function BookingSubmissionError({
  problem,
  onDismiss,
}: {
  problem: FormMessage;
  onDismiss: () => void;
}) {
  return (
    <Card padding="lg" className={styles.feedback} role="alert">
      <StatusPanel
        tone="info"
        autoFocus
        icon={<AlertTriangleIcon />}
        title="Booking submission failed"
        actions={
          <Button variant="secondary" onClick={onDismiss}>
            Dismiss
          </Button>
        }
      >
        <strong>{problem.title}.</strong> {problem.message} Please try again or
        select a different time.
      </StatusPanel>
    </Card>
  );
}
