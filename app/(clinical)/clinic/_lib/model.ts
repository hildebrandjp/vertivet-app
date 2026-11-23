export const SPECIES = ["dog", "cat", "rabbit", "bird", "other"] as const;
export type ClinicalSpecies = (typeof SPECIES)[number];

export function isClinicalSpecies(value: unknown): value is ClinicalSpecies {
  return SPECIES.some((species) => species === value);
}

export interface VaccinationStatus {
  status: "current" | "due" | "overdue";
  label: string;
}

export interface ClinicalPatient {
  id: string;
  name: string;
  breed: string;
  age?: string;
  owner: string;
  ownerId?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  species?: ClinicalSpecies;
  chip?: string;
  chipVerified?: boolean;
  vaccination?: VaccinationStatus;
  vitals?: { weightKg: number; temperatureF: number; heartRate: number };
}

export type QueueStatus =
  | "in_exam"
  | "checked_in"
  | "waiting"
  | "scheduled"
  | "called";

export interface ClinicalVisit {
  id: string;
  patientId: string;
  startsAt: string;
  reason: string;
  status: QueueStatus;
}

export interface ClinicalAlert {
  id: string;
  title: string;
  description: string;
  tone: "info" | "warning";
}

export interface ClinicalEntry {
  id: string;
  patientId: string;
  kind: "note" | "prescription" | "lab";
  text: string;
}

export interface PracticeOverview {
  date: string;
  clinicName: string;
  room: string;
  counts: { booked: number; patients: number; owners: number; reports: number };
  patients: ClinicalPatient[];
  queue: ClinicalVisit[];
  alerts: ClinicalAlert[];
  entries: ClinicalEntry[];
}

export type ClinicalChange =
  | {
      kind: "intake";
      name: string;
      breed: string;
      owner: string;
      chip: string;
      species?: ClinicalSpecies;
      ownerEmail?: string;
      ownerPhone?: string;
    }
  | { kind: "microchip"; patientId: string; chip: string }
  | { kind: "call"; visitId: string }
  | { kind: ClinicalEntry["kind"]; patientId: string; text: string };

export const QUEUE_LABELS = {
  in_exam: "In Exam",
  checked_in: "Checked In",
  waiting: "Waiting Room",
  scheduled: "Scheduled",
  called: "Called In",
} as const;

export const ENTRY_LABELS = {
  note: "Examination Note",
  prescription: "Prescription Draft",
  lab: "Lab Order Draft",
} as const;
