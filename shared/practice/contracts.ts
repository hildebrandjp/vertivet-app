export const SPECIES = ["dog", "cat", "rabbit", "bird", "other"] as const;
export type Species = (typeof SPECIES)[number];

export const LIMITS = {
  clinic: 80,
  email: 254,
  password: 256,
  name: 100,
  patientId: 80,
  reason: 160,
} as const;

export const MEMBERSHIP_ROLE = {
  administrator: "administrator",
  veterinarian: "veterinarian",
  staff: "staff",
} as const;

export const WORKSPACE_PAGE_SIZE = 20;
export const PRACTICE_GRAPHQL = {
  path: "/api/graphql",
  mediaType: "application/json",
} as const;

export type SignInInput = { clinic: string; email: string; password: string };
export type RegisterPatientInput = {
  name: string;
  species: Species;
  owner: string;
  email: string;
};
export type BookAppointmentInput = {
  patientId: string;
  startsAt: string;
  reason: string;
};
export type MemberSummary = { name: string; clinic: string };
export type Patient = {
  id: string;
  name: string;
  species: Species;
  owner: string;
};
export type Appointment = {
  id: string;
  patient: string;
  startsAt: string;
  reason: string;
};
export type Page<T> = { items: T[]; hasMore: boolean };
export type WorkspaceSnapshot = {
  member: MemberSummary;
  patients: Page<Patient>;
  appointments: Page<Appointment>;
};
