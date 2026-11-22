/**
 * Display formatting for app data. Pure functions: the locale and time zone
 * come from shared config so server and client always print the same text.
 */
import type { Tone } from "@/app/shared/common";
import {
  APP_CURRENCY,
  APP_LOCALE,
  APP_TIME_ZONE,
} from "@/app/shared/config/locale";
import { fromISODate, getAge } from "@/app/shared/utils/date";
import { pluralize } from "@/app/shared/utils/text";
import type { AppointmentStatus, Pet, Species } from "./data/types";

const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: APP_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TIME_ZONE,
});

/** "Nov 06, 2026" */
export function formatAppointmentDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** "10:30 AM" */
export function formatAppointmentTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

const SPECIES_LABELS: Record<Species, string> = {
  dog: "Dog",
  cat: "Cat",
  rabbit: "Rabbit",
  bird: "Bird",
  other: "Pet",
};

export function formatSpecies(species: Species): string {
  return SPECIES_LABELS[species];
}

/** "3 years", "8 months", "Under 1 month". */
export function formatPetAge(birthDate: string, today: Date): string {
  const birth = fromISODate(birthDate);
  if (!birth) return "Age unknown";
  const { years, months } = getAge(birth, today);
  if (years > 0) return pluralize(years, "year");
  if (months > 0) return pluralize(months, "month");
  return "Under 1 month";
}

/** "Dog · 3 years" (table) or "Golden Retriever · 3 years" (cards). */
export function describePet(
  pet: Pet,
  today: Date,
  { detail = "species" }: { detail?: "species" | "breed" } = {},
): string {
  const kind = detail === "breed" ? pet.breed : formatSpecies(pet.species);
  return `${kind} · ${formatPetAge(pet.birthDate, today)}`;
}

/** Label and badge tone for each appointment status. */
export const APPOINTMENT_STATUS: Record<
  AppointmentStatus,
  { label: string; tone: Tone }
> = {
  confirmed: { label: "Confirmed", tone: "primary" },
  pending: { label: "Pending", tone: "accent" },
  cancelled: { label: "Cancelled", tone: "danger" },
  completed: { label: "Completed", tone: "neutral" },
};

const currencyFormatter = new Intl.NumberFormat(APP_LOCALE, {
  style: "currency",
  currency: APP_CURRENCY,
});

/** 4500 -> "$45.00" (prices are stored in minor units). */
export function formatPrice(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

/** 30 -> "30 mins", 60 -> "60 mins", 1 -> "1 min". */
export function formatDuration(minutes: number): string {
  return `${minutes} ${minutes === 1 ? "min" : "mins"}`;
}

const slotFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/** Clinic-local "14:30" -> "02:30 PM" (no time-zone shifting). */
export function formatSlotTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  return slotFormatter.format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}

const longDayFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  weekday: "long",
  month: "short",
  day: "2-digit",
  year: "numeric",
});

/** "2026-11-24" -> "Tuesday, Nov 24, 2026" (calendar date, no time zone). */
export function formatDay(isoDate: string): string {
  const date = fromISODate(isoDate);
  return date ? longDayFormatter.format(date) : isoDate;
}

const shortDayFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  month: "short",
  day: "numeric",
});

/** "2026-10-07" -> "Oct 7". */
export function formatShortDay(isoDate: string): string {
  const date = fromISODate(isoDate);
  return date ? shortDayFormatter.format(date) : isoDate;
}

const fullDayFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

/** "2026-10-07" -> "Wednesday, October 7, 2026". */
export function formatFullDay(isoDate: string): string {
  const date = fromISODate(isoDate);
  return date ? fullDayFormatter.format(date) : isoDate;
}
