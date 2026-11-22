import type { ReactNode } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Badge } from "@/app/shared/ui/Badge";
import { Button } from "@/app/shared/ui/Button";
import { Card, CardHeader } from "@/app/shared/ui/Card";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  HeartIcon,
} from "@/app/shared/ui/icons";
import type { Pet, ServiceOffering, TimeSlot } from "../../../_lib/data/types";
import {
  formatDuration,
  formatFullDay,
  formatPetAge,
  formatPrice,
  formatSlotTime,
} from "../../../_lib/format";
import type { BookingDraft } from "../_lib/booking";
import styles from "./review.module.css";

/** A labelled summary section with slots for any content and edit action. */
export function BookingSummarySection({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.sectionHeading}>
        <h3>
          {icon}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function BookingSummary({
  pet,
  service,
  draft,
  slot,
  onEdit,
  disabled,
  children,
}: {
  pet: Pet;
  service: ServiceOffering;
  draft: BookingDraft;
  slot?: TimeSlot;
  onEdit: (step: number) => void;
  disabled: boolean;
  children?: ReactNode;
}) {
  return (
    <Card padding="lg" className={styles.summary}>
      <CardHeader divider>
        <h2 className={styles.cardTitle}>
          <FileTextIcon />
          Appointment Summary
        </h2>
      </CardHeader>
      <BookingSummarySection title="Pet information" icon={<HeartIcon />}>
        <Card variant="muted" className={styles.pet}>
          <Avatar name={pet.name} src={pet.photoUrl} size="xl" decorative />
          <div className={styles.petDetails}>
            <h3>{pet.name}</h3>
            <p>{pet.breed}</p>
            <Badge variant="outline">
              {formatPetAge(pet.birthDate, new Date())}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onEdit(0)}
            aria-label="Edit pet selection"
          >
            Edit
          </Button>
        </Card>
      </BookingSummarySection>
      <BookingSummarySection
        title="Service selected"
        icon={<CheckCircleIcon />}
      >
        <Card variant="muted">
          <div className={styles.serviceHeading}>
            <h3>{service.name}</h3>
            <Badge variant="outline" shape="pill">
              <ClockIcon />
              {formatDuration(service.durationMinutes)}
            </Badge>
          </div>
          <p className={styles.muted}>{service.description}</p>
          <div className={styles.serviceFooter}>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onEdit(0)}
            >
              Change Service
            </Button>
            <span>{formatPrice(service.priceCents)} estimated</span>
          </div>
        </Card>
      </BookingSummarySection>
      <BookingSummarySection
        title="Date & time"
        icon={<CalendarIcon />}
        action={
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onEdit(1)}
          >
            Change
          </Button>
        }
      >
        <dl className={styles.dateGrid}>
          <Card variant="muted">
            <dt>Scheduled date</dt>
            <dd>{draft.date ? formatFullDay(draft.date) : "Not selected"}</dd>
          </Card>
          <Card variant="muted">
            <dt>Scheduled time</dt>
            <dd>{draft.time ? formatSlotTime(draft.time) : "Not selected"}</dd>
          </Card>
        </dl>
        <Alert variant="callout" tone="info" className={styles.arrival}>
          Arrive 15 minutes early for check-in
          {slot?.location ? (
            <>
              {" "}
              at <strong>{slot.location}</strong>
            </>
          ) : (
            "."
          )}
          {slot?.provider ? (
            <>
              {" "}
              Your clinician is <strong>{slot.provider}</strong>.
            </>
          ) : null}
        </Alert>
      </BookingSummarySection>
      {children}
    </Card>
  );
}
