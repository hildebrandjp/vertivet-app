/** Shapes returned by the VertiVet API for the signed-in app. */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
}

export type Species = "dog" | "cat" | "rabbit" | "bird" | "other";

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  /** ISO date (YYYY-MM-DD). */
  birthDate: string;
  photoUrl?: string | null;
}

export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed";

export interface Appointment {
  id: string;
  petId: string;
  service: string;
  /** ISO date-time with offset, e.g. 2026-11-06T10:30:00Z. */
  startsAt: string;
  status: AppointmentStatus;
}

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
