import "server-only";
import type {
  AppNotification,
  Appointment,
  NavCounts,
  Pet,
  ServiceOffering,
  TimeSlot,
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

export const DEMO_SERVICES: ServiceOffering[] = [
  {
    id: "svc_checkup",
    name: "General Checkup",
    description:
      "Routine wellness examination including weight check and vital signs.",
    durationMinutes: 30,
    priceCents: 4500,
    icon: "checkup",
  },
  {
    id: "svc_vaccines",
    name: "Vaccinations",
    description: "Essential annual booster shots and preventive immunization.",
    durationMinutes: 20,
    priceCents: 3000,
    icon: "vaccination",
  },
  {
    id: "svc_grooming",
    name: "Professional Grooming",
    description: "Bath, hair trimming, and nail clipping by our specialists.",
    durationMinutes: 60,
    priceCents: 6500,
    icon: "grooming",
  },
  {
    id: "svc_consult",
    name: "Consultation",
    description:
      "Deep-dive session for specific health concerns or behavioral issues.",
    durationMinutes: 45,
    priceCents: 8000,
    icon: "consultation",
  },
];

const DEMO_PROVIDERS = [
  "Dr. Sarah Jenkins",
  "Dr. Emma Wilson",
  "Dr. Marcus Chen",
];

/**
 * Deterministic fake availability: 09:00–16:30 every 30 minutes, closed on
 * Sundays, with some slots taken (stable per date so the UI is predictable).
 */
export function demoSlots(serviceId: string, date: string): TimeSlot[] {
  const [y, m, d] = date.split("-").map(Number);
  if (new Date(y, m - 1, d).getDay() === 0) return [];
  const seed = [...`${serviceId}${date}`].reduce(
    (sum, c) => sum + c.charCodeAt(0),
    0,
  );
  return Array.from({ length: 16 }, (_, i) => {
    const minutes = 9 * 60 + i * 30;
    const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 === 0 ? "00" : "30"}`;
    return {
      time,
      available: (seed + i * 7) % 5 !== 0,
      provider: DEMO_PROVIDERS[(seed + i) % DEMO_PROVIDERS.length],
      location: `VertiVet Central (Room ${(i % 3) + 1})`,
    };
  });
}
