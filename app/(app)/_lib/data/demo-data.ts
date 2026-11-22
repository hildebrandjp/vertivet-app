import "server-only";
import type {
  AppNotification,
  Appointment,
  NavCounts,
  Pet,
  User,
} from "./types";

/**
 * Fixtures for demo mode only (development without API_BASE_URL).
 * See isDemoMode() in shared/server/env.ts. Never used in production.
 */

export const DEMO_USER: User = {
  id: "u_demo",
  firstName: "Alex",
  lastName: "Rivers",
  email: "alex.rivers@example.com",
};

export const DEMO_PETS: Pet[] = [
  {
    id: "p_luna",
    name: "Luna",
    species: "dog",
    breed: "Golden Retriever",
    birthDate: "2023-03-14",
  },
  {
    id: "p_milo",
    name: "Milo",
    species: "cat",
    breed: "Domestic Shorthair",
    birthDate: "2024-06-02",
  },
];

export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    petId: "p_luna",
    service: "Annual wellness exam",
    startsAt: "2026-11-06T10:30:00Z",
    status: "confirmed",
  },
  {
    id: "a2",
    petId: "p_milo",
    service: "Vaccination booster",
    startsAt: "2026-11-09T14:00:00Z",
    status: "confirmed",
  },
  {
    id: "a3",
    petId: "p_luna",
    service: "Dental check-up",
    startsAt: "2026-11-12T09:00:00Z",
    status: "pending",
  },
  {
    id: "a4",
    petId: "p_milo",
    service: "Nutrition consultation",
    startsAt: "2026-11-16T11:30:00Z",
    status: "confirmed",
  },
  {
    id: "a5",
    petId: "p_luna",
    service: "Follow-up visit",
    startsAt: "2026-11-20T10:00:00Z",
    status: "confirmed",
  },
];

export const DEMO_NAV_COUNTS: NavCounts = { pets: 128, appointmentsToday: 18 };

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "Luna's dental check-up is awaiting confirmation",
    href: "/appointments/a3",
    read: false,
  },
  {
    id: "n2",
    title: "Milo's vaccination booster is confirmed",
    href: "/appointments/a2",
    read: true,
  },
];
