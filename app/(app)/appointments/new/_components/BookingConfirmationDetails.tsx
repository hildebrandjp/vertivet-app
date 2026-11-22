import type { ReactNode } from "react";
import { Badge } from "@/app/shared/ui/Badge";
import { Card } from "@/app/shared/ui/Card";
import {
  CalendarIcon,
  CheckCircleIcon,
  HeartIcon,
  InfoIcon,
} from "@/app/shared/ui/icons";
import { formatFullDay, formatSlotTime } from "../../../_lib/format";
import type { BookingConfirmationData } from "../_lib/confirmation";
import styles from "./confirmation.module.css";

/** Icon, label, value and supporting text compose any receipt detail. */
export function ConfirmationDetail({
  icon,
  label,
  children,
  description,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className={styles.detail}>
      <span className={styles.detailIcon} aria-hidden="true">
        {icon}
      </span>
      <div>
        <dt>{label}</dt>
        <dd>
          {children}
          {description ? (
            <span className={styles.detailDescription}>{description}</span>
          ) : null}
        </dd>
      </div>
    </div>
  );
}

export function BookingConfirmationDetails({
  data,
  footer,
}: {
  data: BookingConfirmationData;
  footer?: ReactNode;
}) {
  const bookedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: data.timeZone,
  }).format(new Date(data.bookedAt));
  return (
    <Card padding="none" className={styles.receipt}>
      <header className={styles.receiptHeader}>
        <h2>Appointment Details</h2>
        {data.id ? (
          <Badge variant="soft" tone="neutral" shape="pill">
            ID: {data.id}
          </Badge>
        ) : null}
      </header>
      <div className={styles.receiptBody}>
        <dl className={styles.detailsGrid}>
          <ConfirmationDetail
            icon={<HeartIcon />}
            label="Patient"
            description={data.pet.breed}
          >
            {data.pet.name}
          </ConfirmationDetail>
          <ConfirmationDetail
            icon={<CalendarIcon />}
            label="Date & time"
            description={`${formatSlotTime(data.time)} · ${data.timeZone}`}
          >
            {formatFullDay(data.date)}
          </ConfirmationDetail>
          <ConfirmationDetail
            icon={<CheckCircleIcon />}
            label="Service"
            description={
              data.provider
                ? `with ${data.provider}`
                : `${data.service.durationMinutes} minutes`
            }
          >
            {data.service.name}
          </ConfirmationDetail>
          <ConfirmationDetail icon={<InfoIcon />} label="Location">
            {data.location || "The clinic will provide your visit location."}
          </ConfirmationDetail>
        </dl>
        <section className={styles.notes} aria-label="Additional notes">
          <h3>Additional Notes</h3>
          <p>
            Arrive 15 minutes early for check-in and bring your pet’s
            vaccination records.
          </p>
          {data.notes ? (
            <div className={styles.personalNotes}>
              <h3>Your notes for the clinic</h3>
              <p>{data.notes}</p>
            </div>
          ) : null}
        </section>
      </div>
      <footer className={styles.receiptFooter}>
        {footer}
        <span className={styles.bookedAt}>
          Booked on <time dateTime={data.bookedAt}>{bookedAt}</time> (
          {data.timeZone})
        </span>
      </footer>
    </Card>
  );
}
