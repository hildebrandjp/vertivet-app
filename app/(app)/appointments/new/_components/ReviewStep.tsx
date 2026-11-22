"use client";

import { useEffect } from "react";

import { useActionForm } from "@/app/shared/hooks/useActionForm";
import { Field } from "@/app/shared/ui/Field";
import { TextArea } from "@/app/shared/ui/TextArea";
import { CLINIC_CONTACT } from "../../../_lib/content";
import type { Pet, ServiceOffering, TimeSlot } from "../../../_lib/data/types";
import {
  BOOKING_FIELDS,
  BOOKING_INITIAL_STATE,
  type BookingDraft,
  type BookingField,
  type BookingState,
  NOTES_MAX_LENGTH,
  validateBooking,
} from "../_lib/booking";
import { bookAppointment } from "../actions";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingCareCard, BookingReviewActions } from "./BookingReviewAside";
import { BookingSubmissionError } from "./BookingSubmissionError";
import { BookingSummary } from "./BookingSummary";
import styles from "./review.module.css";

interface ReviewStepProps {
  pet: Pet;
  service: ServiceOffering;
  draft: BookingDraft;
  slot?: TimeSlot;
  onEdit: (stepIndex: number) => void;
  onNotesChange: (notes: string) => void;
  onBookAnother: () => void;
  onSubmitted: (submitted: boolean) => void;
}

/** Owns submission state; presentation components receive data and actions. */
export function ReviewStep({
  pet,
  service,
  draft,
  slot,
  onEdit,
  onNotesChange,
  onBookAnother,
  onSubmitted,
}: ReviewStepProps) {
  const form = useActionForm<BookingField, BookingState>({
    action: bookAppointment,
    initialState: BOOKING_INITIAL_STATE,
    fields: BOOKING_FIELDS,
    validate: validateBooking,
  });
  useEffect(() => {
    onSubmitted(form.succeeded);
  }, [form.succeeded, onSubmitted]);
  if (form.succeeded && form.state.receipt) {
    return (
      <BookingConfirmation
        data={{
          ...form.state.receipt,
          pet,
          service,
          date: form.state.values?.date ?? draft.date ?? "",
          time: form.state.values?.time ?? draft.time ?? "",
          notes: form.state.values?.notes ?? draft.notes,
          provider: slot?.provider,
          location: slot?.location,
        }}
        onBookAnother={onBookAnother}
      />
    );
  }

  const firstFieldError = Object.values(form.fieldErrors)[0];
  const problem =
    form.formError ??
    (firstFieldError
      ? { title: "Some details are missing", message: firstFieldError }
      : null);
  const dismissProblem = () => {
    form.dismissFormError();
    for (const field of BOOKING_FIELDS) form.clearFieldError(field);
  };

  return (
    <form
      action={form.formAction}
      onSubmit={form.onSubmit}
      className={styles.form}
      aria-busy={form.pending}
    >
      {problem ? (
        <BookingSubmissionError problem={problem} onDismiss={dismissProblem} />
      ) : null}
      <fieldset disabled={form.pending} className={styles.layout}>
        <legend className="sr-only">Review your booking</legend>
        <BookingSummary
          pet={pet}
          service={service}
          draft={draft}
          slot={slot}
          onEdit={onEdit}
          disabled={form.pending}
        >
          <Field
            label="Notes for the clinic (optional)"
            hint={`Symptoms, behaviour or anything the team should know. Up to ${NOTES_MAX_LENGTH} characters.`}
          >
            <TextArea
              name="notes"
              rows={3}
              maxLength={NOTES_MAX_LENGTH}
              placeholder="Anything you would like the team to know?"
              value={draft.notes}
              onChange={(event) => {
                onNotesChange(event.target.value);
                form.clearFieldError("notes");
              }}
            />
          </Field>
        </BookingSummary>
        <aside
          className={styles.aside}
          aria-label="Booking actions and guidance"
        >
          <BookingReviewActions
            pending={form.pending}
            onBack={() => onEdit(1)}
          />
          <BookingCareCard />
        </aside>
      </fieldset>
      <input type="hidden" name="petId" value={pet.id} />
      <input type="hidden" name="serviceId" value={service.id} />
      <input type="hidden" name="date" value={draft.date ?? ""} />
      <input type="hidden" name="time" value={draft.time ?? ""} />
      <footer className={styles.support}>
        Need assistance with your booking? Contact our team at{" "}
        <a href={`tel:${CLINIC_CONTACT.phoneHref}`}>{CLINIC_CONTACT.phone}</a>
      </footer>
    </form>
  );
}
