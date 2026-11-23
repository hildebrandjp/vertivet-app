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
    weightKg: 28.4,
    sex: "female",
    altered: true,
    preventiveCare: [
      {
        id: "rabies",
        name: "Rabies",
        kind: "vaccination",
        status: "current",
        dueDate: "2027-08-14",
      },
      { id: "dhpp", name: "DHPP", kind: "vaccination", status: "current" },
      {
        id: "dental",
        name: "Dental",
        kind: "preventive",
        status: "scheduled",
        dueDate: "2027-02-23",
      },
    ],
    clinicalRecords: [
      {
        id: "blood-panel",
        title: "Annual Blood Chemistry & Lipid Panel",
        date: "2026-08-14",
        clinician: "Dr. Sarah Jenkins",
        summary:
          "Normal vitals. Blood chemistry and lipid results were within the expected ranges.",
        status: "normal",
      },
    ],
  },
  {
    id: "p_milo",
    name: "Milo",
    species: "cat",
    breed: "Domestic Shorthair",
    birthDate: "2024-06-02",
    weightKg: 4.6,
    sex: "male",
    altered: true,
    preventiveCare: [
      {
        id: "rabies",
        name: "Rabies",
        kind: "vaccination",
        status: "current",
        dueDate: "2027-07-02",
      },
      {
        id: "fvrcp",
        name: "FVRCP",
        kind: "vaccination",
        status: "due",
        dueDate: "2026-12-09",
      },
      { id: "felv", name: "FeLV", kind: "vaccination", status: "current" },
    ],
    clinicalRecords: [
      {
        id: "dental-xray",
        title: "Feline Dental X-Ray & Oral Assessment",
        date: "2026-07-02",
        clinician: "Dr. Emma Wilson",
        summary:
          "Grade 1 gingivitis noted. A follow-up oral assessment was advised.",
        status: "follow-up",
      },
    ],
  },
];

const DEMO_VISIT_TEMPLATES: Appointment[] = [
  {
    id: "a1",
    serviceId: "svc_checkup",
    description: "Routine wellness consultation",
    durationMinutes: 30,
    provider: "Dr. Sarah Jenkins",
    location: "Exam Room 2 · Central",
    petId: "p_luna",
    service: "Annual wellness exam",
    startsAt: "2026-11-06T10:30:00Z",
    status: "confirmed",
  },
  {
    id: "a2",
    serviceId: "svc_vaccines",
    description: "Annual booster",
    durationMinutes: 20,
    provider: "Dr. Emma Wilson",
    location: "Suite 1 · Central",
    petId: "p_milo",
    service: "Vaccination booster",
    startsAt: "2026-11-09T14:00:00Z",
    status: "confirmed",
  },
  {
    id: "a3",
    serviceId: "svc_consult",
    description: "Dental examination and treatment plan",
    durationMinutes: 45,
    provider: "Dr. Sarah Jenkins",
    location: "Dental Suite B",
    petId: "p_luna",
    service: "Dental check-up",
    startsAt: "2026-11-12T09:00:00Z",
    status: "pending",
  },
  {
    id: "a4",
    serviceId: "svc_consult",
    description: "Weight and dietary management",
    durationMinutes: 45,
    provider: "Dr. Robert Hayes",
    location: "Exam Room 3 · Central",
    petId: "p_milo",
    service: "Nutrition consultation",
    startsAt: "2026-11-16T11:30:00Z",
    status: "confirmed",
  },
  {
    id: "a5",
    serviceId: "svc_consult",
    description: "Recovery review",
    durationMinutes: 45,
    provider: "Dr. Sarah Jenkins",
    location: "Exam Room 2 · Central",
    petId: "p_luna",
    service: "Follow-up visit",
    startsAt: "2026-11-20T10:00:00Z",
    status: "confirmed",
  },
];

/** Keep demo visits actionable as the calendar moves forward. */
export function demoAppointments(now = new Date()): Appointment[] {
  const startsAt = (days: number, template: Appointment) => {
    const date = new Date(now);
    const templateDate = new Date(template.startsAt);
    date.setUTCDate(date.getUTCDate() + days);
    date.setUTCHours(
      templateDate.getUTCHours(),
      templateDate.getUTCMinutes(),
      0,
      0,
    );
    return date.toISOString();
  };
  const upcoming = DEMO_VISIT_TEMPLATES.slice(0, 4).map((visit, index) => ({
    ...visit,
    startsAt: startsAt(4 + index * 3, visit),
  }));
  const history = Array.from({ length: 14 }, (_, index): Appointment => {
    const visit = DEMO_VISIT_TEMPLATES[index % DEMO_VISIT_TEMPLATES.length];
    return {
      ...visit,
      id: `history-${index + 1}`,
      startsAt: startsAt(-7 - index * 7, visit),
      status: index === 2 ? "cancelled" : "completed",
    };
  });
  return [...upcoming, ...history];
}

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
