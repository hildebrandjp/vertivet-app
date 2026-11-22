"use client";

import type { ReactNode } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { useActionForm } from "@/app/shared/hooks/useActionForm";
import { Alert } from "@/app/shared/ui/Alert";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import { Field } from "@/app/shared/ui/Field";
import { ChevronLeftIcon } from "@/app/shared/ui/icons";
import { StatusPanel } from "@/app/shared/ui/StatusPanel";
import { TextArea } from "@/app/shared/ui/TextArea";
import type { Pet, ServiceOffering } from "../../../_lib/data/types";
import {
  formatDay,
  formatDuration,
  formatPrice,
  formatSlotTime,
} from "../../../_lib/format";
import {
  BOOKING_FIELDS,
  BOOKING_INITIAL_STATE,
  type BookingDraft,
  NOTES_MAX_LENGTH,
  validateBooking,
} from "../_lib/booking";
import { bookAppointment } from "../actions";
import styles from "./booking.module.css";
import { WizardFooter } from "./WizardFooter";

interface ReviewStepProps {
  pet: Pet;
  service: ServiceOffering;
  draft: BookingDraft;
  /** Jump back to a step to change something. */
  onEdit: (stepIndex: number) => void;
  onNotesChange: (notes: string) => void;
  onBookAnother: () => void;
}

function SummaryRow({
  label,
  children,
  onEdit,
}: {
  label: string;
  children: ReactNode;
  onEdit?: () => void;
}) {
  return (
    <div className={styles.summaryRow}>
      <dt className={styles.summaryLabel}>{label}</dt>
      <dd className={styles.summaryValue}>{children}</dd>
      {onEdit ? (
        <dd className={styles.summaryAction}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            aria-label={`Change ${label.toLowerCase()}`}
          >
            Change
          </Button>
        </dd>
      ) : null}
    </div>
  );
}

/** Step 3: summary, then a Server Action confirms the booking. */
export function ReviewStep({
  pet,
  service,
  draft,
  onEdit,
  onNotesChange,
  onBookAnother,
}: ReviewStepProps) {
  const form = useActionForm({
    action: bookAppointment,
    initialState: BOOKING_INITIAL_STATE,
    fields: BOOKING_FIELDS,
    validate: validateBooking,
  });
  const when =
    draft.date && draft.time
      ? `${formatDay(draft.date)} at ${formatSlotTime(draft.time)}`
      : "";

  if (form.succeeded) {
    return (
      <Card padding="lg">
        <StatusPanel
          autoFocus
          title="Appointment requested"
          actions={
            <>
              <ButtonLink href={ROUTES.dashboard}>Go to Dashboard</ButtonLink>
              <Button variant="ghost" onClick={onBookAnother}>
                Book another appointment
              </Button>
            </>
          }
        >
          <strong>{pet.name}</strong>&apos;s {service.name.toLowerCase()} on{" "}
          <strong>{when}</strong> is awaiting confirmation. We&apos;ll notify
          you as soon as the clinic confirms.
        </StatusPanel>
      </Card>
    );
  }

  const firstFieldError = Object.values(form.fieldErrors)[0];
  const problem =
    form.formError ??
    (firstFieldError
      ? { title: "Some details are missing", message: firstFieldError }
      : null);

  return (
    <form
      action={form.formAction}
      onSubmit={form.onSubmit}
      className={styles.reviewForm}
    >
      <Card padding="lg">
        <dl className={styles.summary}>
          <SummaryRow label="Pet" onEdit={() => onEdit(0)}>
            <span className={styles.petOption}>
              <Avatar name={pet.name} src={pet.photoUrl} decorative />
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{pet.name}</span>
                <span className={styles.optionMeta}>{pet.breed}</span>
              </span>
            </span>
          </SummaryRow>
          <SummaryRow label="Service" onEdit={() => onEdit(0)}>
            {service.name} · {formatDuration(service.durationMinutes)}
          </SummaryRow>
          <SummaryRow label="Date & time" onEdit={() => onEdit(1)}>
            {when}
          </SummaryRow>
          <SummaryRow label="Estimated total">
            <span className={styles.price}>
              {formatPrice(service.priceCents)}
            </span>
          </SummaryRow>
        </dl>
      </Card>

      <Field
        label="Notes for the clinic (optional)"
        hint={`Symptoms, behaviour or anything the team should know. Up to ${NOTES_MAX_LENGTH} characters.`}
      >
        <TextArea
          name="notes"
          rows={3}
          maxLength={NOTES_MAX_LENGTH}
          placeholder="e.g. He has been scratching his left ear since Monday."
          value={draft.notes}
          onChange={(event) => onNotesChange(event.target.value)}
        />
      </Field>

      <input type="hidden" name="petId" value={pet.id} />
      <input type="hidden" name="serviceId" value={service.id} />
      <input type="hidden" name="date" value={draft.date ?? ""} />
      <input type="hidden" name="time" value={draft.time ?? ""} />

      {problem ? (
        <Alert
          tone="danger"
          title={problem.title}
          onDismiss={form.dismissFormError}
        >
          {problem.message}
        </Alert>
      ) : null}

      <WizardFooter
        start={
          <Button
            variant="secondary"
            startIcon={<ChevronLeftIcon />}
            disabled={form.pending}
            onClick={() => onEdit(1)}
          >
            Back
          </Button>
        }
        end={
          <Button type="submit" size="lg" loading={form.pending}>
            Confirm Booking
          </Button>
        }
      />
    </form>
  );
}
