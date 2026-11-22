import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { Card } from "@/app/shared/ui/Card";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@/app/shared/ui/icons";
import styles from "./confirmation.module.css";

function ActionContent({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <>
      <span className={styles.nextIcon} aria-hidden="true">
        {icon}
      </span>
      <strong>{title}</strong>
      <span>{description}</span>
    </>
  );
}

/** Links navigate; buttons perform actions. Each card shares one visual shell. */
export function BookingNextActions({
  onBookAnother,
  onPreVisit,
}: {
  onBookAnother: () => void;
  onPreVisit: () => void;
}) {
  return (
    <nav className={styles.nextActions} aria-label="Next steps">
      <Card padding="none">
        <Link href={ROUTES.dashboard} className={styles.nextAction}>
          <ActionContent
            icon={<HomeIcon />}
            title="Back to Dashboard"
            description="Overview of all pet care"
          />
        </Link>
      </Card>
      <Card padding="none">
        <button
          type="button"
          className={styles.nextAction}
          onClick={onBookAnother}
        >
          <ActionContent
            icon={<CheckCircleIcon />}
            title="Book Another Pet"
            description="Schedule care for a sibling"
          />
        </button>
      </Card>
      <Card padding="none">
        <button
          type="button"
          className={styles.nextAction}
          onClick={onPreVisit}
        >
          <ActionContent
            icon={<ChevronRightIcon />}
            title="Pre-Visit Form"
            description="Save time at check-in"
          />
        </button>
      </Card>
    </nav>
  );
}
