/**
 * Booking flow contract, shared by the client wizard and the Server Actions:
 * steps, draft rules, validation and copy. Pure module (no server/browser APIs).
 */
import { type FormState, idleState } from "@/app/shared/forms/form-state";
import { createValidator, rules } from "@/app/shared/forms/validation";
import { addDays } from "@/app/shared/utils/date";
import type { BookingReceipt } from "./confirmation";

export const BOOKING_STEPS = [
  { id: "details", label: "Pet & Service" },
  { id: "schedule", label: "Date & Time" },
  { id: "review", label: "Review" },
] as const;

export type BookingStepId = (typeof BOOKING_STEPS)[number]["id"];

export const STEP_COPY: Record<
  BookingStepId,
  { title: string; description: string }
> = {
  details: {
    title: "Book an Appointment",
    description: "Start by selecting your pet and the service they need.",
  },
  schedule: {
    title: "Select Date & Time",
    description:
      "Choose a preferred appointment date from the calendar and pick an available time slot.",
  },
  review: {
    title: "Review Your Booking",
    description:
      "Please verify all details before confirming your appointment.",
  },
};

/** How many days ahead appointments can be booked. */
export const BOOKING_WINDOW_DAYS = 60;
export const NOTES_MAX_LENGTH = 500;

export interface BookingDraft {
  petId: string | null;
  serviceId: string | null;
  /** Clinic-local "YYYY-MM-DD". */
  date: string | null;
  /** Clinic-local "HH:MM". */
  time: string | null;
  notes: string;
}

export const EMPTY_DRAFT: BookingDraft = {
  petId: null,
  serviceId: null,
  date: null,
  time: null,
  notes: "",
};

/** Applies a change and drops choices it invalidates (slots depend on both). */
export function applyDraftChange(
  previous: BookingDraft,
  patch: Partial<BookingDraft>,
): BookingDraft {
  const next = { ...previous, ...patch };
  const serviceChanged =
    "serviceId" in patch && patch.serviceId !== previous.serviceId;
  const dateChanged = "date" in patch && patch.date !== previous.date;
  if (serviceChanged || dateChanged) next.time = null;
  return next;
}

/** What still blocks leaving `stepIndex`, or null when it is complete. */
export function missingForStep(
  stepIndex: number,
  draft: BookingDraft,
): string | null {
  if (stepIndex === 0) {
    if (!draft.petId) return "Select a pet to continue.";
    if (!draft.serviceId) return "Choose a service to continue.";
  }
  if (stepIndex === 1) {
    if (!draft.date) return "Pick a date to continue.";
    if (!draft.time) return "Pick an available time to continue.";
  }
  return null;
}

/** Furthest step the draft allows (guards deep links like ?step=review). */
export function highestReachableStep(draft: BookingDraft): number {
  for (let index = 0; index < BOOKING_STEPS.length - 1; index++) {
    if (missingForStep(index, draft)) return index;
  }
  return BOOKING_STEPS.length - 1;
}

export function stepIndexOf(id: string | null): number {
  const index = BOOKING_STEPS.findIndex((step) => step.id === id);
  return index === -1 ? 0 : index;
}

/** First and last bookable day, counted from `today` (local calendar days). */
export function bookingWindow(today: Date): { min: Date; max: Date } {
  return { min: today, max: addDays(today, BOOKING_WINDOW_DAYS) };
}

/* ------------------------------------------------- Confirm (Server Action) */

export const BOOKING_FIELDS = [
  "petId",
  "serviceId",
  "date",
  "time",
  "notes",
] as const;
export type BookingField = (typeof BOOKING_FIELDS)[number];
export type BookingState = FormState<BookingField> & {
  receipt?: BookingReceipt;
};
export const BOOKING_INITIAL_STATE: BookingState = idleState();

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const validateBooking = createValidator<BookingField>({
  petId: [rules.required("Select a pet.")],
  serviceId: [rules.required("Choose a service.")],
  date: [
    rules.required("Pick a date."),
    rules.pattern(DATE_PATTERN, "Pick a valid date."),
  ],
  time: [
    rules.required("Pick a time."),
    rules.pattern(TIME_PATTERN, "Pick a valid time."),
  ],
  notes: [rules.maxLength(NOTES_MAX_LENGTH)],
});

export type BookingErrorCode =
  | "invalid_selection"
  | "past_date"
  | "slot_taken"
  | "rejected"
  | "unavailable";

export const BOOKING_ERRORS: Record<
  BookingErrorCode,
  { title: string; message: string }
> = {
  invalid_selection: {
    title: "Selection unavailable",
    message: "That pet or service is no longer available. Please start again.",
  },
  past_date: {
    title: "Date has passed",
    message: "Please go back and pick an upcoming date.",
  },
  slot_taken: {
    title: "Time just booked",
    message:
      "Someone booked that time a moment ago. Please go back and pick another.",
  },
  rejected: {
    title: "Booking not accepted",
    message:
      "The clinic couldn't accept this booking. Please review the details.",
  },
  unavailable: {
    title: "Booking unavailable",
    message:
      "We couldn't reach the clinic right now. Please try again in a moment.",
  },
};
