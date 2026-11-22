/**
 * Display formatting for app data. Pure functions: the locale and time zone
 * come from shared config so server and client always print the same text.
 */
import type { Tone } from "@/app/shared/common";
import { APP_LOCALE, APP_TIME_ZONE } from "@/app/shared/config/locale";
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
