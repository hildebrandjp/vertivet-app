/** Shapes returned by the VertiVet API for the signed-in app. */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
}

export const PET_SPECIES = ["dog", "cat", "rabbit", "bird", "other"] as const;
export type Species = (typeof PET_SPECIES)[number];

export interface PreventiveCare {
  id: string;
  name: string;
  kind: "vaccination" | "preventive";
  status: "current" | "due" | "overdue" | "scheduled";
  dueDate?: string;
}

export interface ClinicalRecord {
  id: string;
  title: string;
  date: string;
  clinician: string;
  summary: string;
  status: "normal" | "follow-up";
}

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  /** ISO date (YYYY-MM-DD). */
  birthDate: string;
  photoUrl?: string | null;
  weightKg?: number;
  sex?: "female" | "male";
  altered?: boolean;
  preventiveCare?: PreventiveCare[];
  clinicalRecords?: ClinicalRecord[];
}

export type NewPet = Pick<Pet, "name" | "species" | "breed" | "birthDate">;

export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed";

export interface Appointment {
  id: string;
  petId: string;
  service: string;
  serviceId?: string;
  description?: string;
  durationMinutes?: number;
  provider?: string | null;
  location?: string | null;
  /** ISO date-time with offset, e.g. 2026-11-06T10:30:00Z. */
  startsAt: string;
  status: AppointmentStatus;
}

export type AppointmentChange =
  | { kind: "confirm" }
  | { kind: "cancel" }
  | { kind: "reschedule"; date: string; time: string };

export interface NavCounts {
  pets: number;
  appointmentsToday: number;
}

export interface AppNotification {
  id: string;
  title: string;
  href?: string;
  read: boolean;
}

export type ServiceIcon =
  | "checkup"
  | "vaccination"
  | "grooming"
  | "consultation";

export interface ServiceOffering {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  /** Price in minor units (cents) to avoid floating-point money. */
  priceCents: number;
  icon: ServiceIcon;
}

export interface TimeSlot {
  /** Clinic-local 24h time, "HH:MM". */
  time: string;
  available: boolean;
  /** Clinician assigned to the slot, e.g. "Dr. Sarah Jenkins". */
  provider?: string | null;
  /** Where the visit happens, e.g. "VertiVet Central (Room 2)". */
  location?: string | null;
}

export interface NewAppointment {
  petId: string;
  serviceId: string;
  /** Clinic-local date, "YYYY-MM-DD". */
  date: string;
  time: string;
  notes: string;
}
