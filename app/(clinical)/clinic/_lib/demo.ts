import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { APP_TIME_ZONE } from "@/app/shared/config/locale";
import { todayInTimeZone } from "@/app/shared/utils/date";
import {
  type ClinicalChange,
  type ClinicalEntry,
  type ClinicalPatient,
  isClinicalSpecies,
  type PracticeOverview,
} from "./model";
import { groupRegistryOwners, normalizeMicrochip } from "./registry";

const COOKIE = "vv_clinical_demo";
const PATIENTS: ClinicalPatient[] = [
  {
    id: "luna",
    species: "dog",
    ownerId: "alex",
    ownerEmail: "alex.rivers@example.test",
    ownerPhone: "+1 (555) 234-5678",
    chipVerified: true,
    vaccination: { status: "current", label: "Rabies valid through 2027" },
    name: "Luna",
    breed: "Golden Retriever",
    age: "3y",
    owner: "Alex Rivers",
    chip: "900100000001",
    vitals: { weightKg: 28.4, temperatureF: 101.4, heartRate: 82 },
  },
  {
    id: "milo",
    species: "cat",
    ownerId: "alex",
    ownerEmail: "alex.rivers@example.test",
    ownerPhone: "+1 (555) 234-5678",
    chipVerified: true,
    vaccination: { status: "due", label: "FVRCP booster due" },
    name: "Milo",
    breed: "Domestic Shorthair",
    age: "2y",
    owner: "Alex Rivers",
    chip: "900100000004",
  },
  {
    id: "barnaby",
    species: "dog",
    ownerId: "claire",
    ownerEmail: "claire.dupont@example.test",
    ownerPhone: "+1 (555) 891-2340",
    chipVerified: true,
    vaccination: { status: "current", label: "All vaccinations current" },
    name: "Barnaby",
    breed: "French Bulldog",
    age: "4y",
    owner: "Claire DuPont",
    chip: "900100000002",
  },
  {
    id: "cleo",
    species: "cat",
    ownerId: "marcus",
    ownerEmail: "marcus.vance@example.test",
    ownerPhone: "+1 (555) 402-9918",
    chipVerified: true,
    vaccination: { status: "overdue", label: "Booster overdue" },
    name: "Cleo",
    breed: "Siamese Cat",
    age: "1y",
    owner: "Marcus Vance",
    chip: "900100000003",
  },
  {
    id: "daisy",
    name: "Daisy",
    breed: "Beagle",
    age: "5y",
    species: "dog",
    owner: "Sarah Jenkins",
    ownerEmail: "sarah.jenkins@example.test",
    chip: "900100000005",
    chipVerified: true,
    vaccination: { status: "current", label: "All vaccinations current" },
  },
  {
    id: "oliver",
    name: "Oliver",
    breed: "Maine Coon",
    age: "3y",
    species: "cat",
    owner: "David Chen",
    ownerEmail: "david.chen@example.test",
    chip: "900100000006",
    chipVerified: true,
    vaccination: { status: "current", label: "Rabies valid through 2027" },
  },
  {
    id: "pepper",
    name: "Pepper",
    breed: "Mixed breed",
    age: "2y",
    species: "dog",
    owner: "Morgan Lee",
    ownerEmail: "morgan.lee@example.test",
  },
];

interface DemoState {
  patients: ClinicalPatient[];
  entries: ClinicalEntry[];
  called: string[];
  chips: Record<string, string>;
}

async function readState(): Promise<DemoState> {
  try {
    const value = JSON.parse((await cookies()).get(COOKIE)?.value ?? "{}");
    const validText = (item: unknown) => typeof item === "string";
    return {
      patients: Array.isArray(value.patients)
        ? value.patients
            .filter(
              (patient: ClinicalPatient) =>
                patient &&
                [
                  patient.id,
                  patient.name,
                  patient.breed,
                  patient.owner,
                  patient.chip,
                ].every(validText),
            )
            .map(
              ({
                id,
                name,
                breed,
                owner,
                chip,
                species,
                ownerEmail,
                ownerPhone,
              }: ClinicalPatient) => ({
                id,
                name,
                breed,
                owner,
                chip,
                species: isClinicalSpecies(species) ? species : undefined,
                ownerEmail: validText(ownerEmail) ? ownerEmail : undefined,
                ownerPhone: validText(ownerPhone) ? ownerPhone : undefined,
              }),
            )
        : [],
      entries: Array.isArray(value.entries)
        ? value.entries.filter(
            (entry: ClinicalEntry) =>
              entry &&
              [entry.id, entry.patientId, entry.text].every(validText) &&
              (entry.kind === "note" ||
                entry.kind === "prescription" ||
                entry.kind === "lab"),
          )
        : [],
      called: Array.isArray(value.called) ? value.called.filter(validText) : [],
      chips: Object.fromEntries(
        Object.entries(value.chips ?? {}).filter(
          (entry): entry is [string, string] =>
            typeof entry[1] === "string" && /^\d{9,15}$/.test(entry[1]),
        ),
      ),
    };
  } catch {
    return { patients: [], entries: [], called: [], chips: {} };
  }
}

function overview(state: DemoState): PracticeOverview {
  const visits = [
    {
      id: "visit-luna",
      patientId: "luna",
      startsAt: "10:00",
      reason: "General Wellness & Bi-Annual Health Checkup",
      status: "in_exam",
    },
    {
      id: "visit-barnaby",
      patientId: "barnaby",
      startsAt: "10:45",
      reason: "Suture Removal & Wound Inspection",
      status: "checked_in",
    },
    {
      id: "visit-cleo",
      patientId: "cleo",
      startsAt: "11:30",
      reason: "Annual Booster & Microchipping",
      status: "waiting",
    },
    {
      id: "visit-milo",
      patientId: "milo",
      startsAt: "14:00",
      reason: "FVRCP Vaccination Booster",
      status: "scheduled",
    },
  ] as const;
  const patients = [...PATIENTS, ...state.patients].map((patient) =>
    Object.hasOwn(state.chips, patient.id)
      ? { ...patient, chip: state.chips[patient.id], chipVerified: false }
      : patient,
  );
  return {
    date: todayInTimeZone(APP_TIME_ZONE),
    clinicName: "VertiVet Central",
    room: "Exam Room 2",
    counts: {
      booked: 6,
      patients: patients.length,
      owners: groupRegistryOwners(patients).length,
      reports: 3,
    },
    patients,
    queue: visits.map((visit) => ({
      ...visit,
      status: state.called.includes(visit.id) ? "called" : visit.status,
    })),
    alerts: [
      {
        id: "sutures",
        title: "Barnaby: Suture Healing Verification",
        description: "Verify post-op skin incision closure prior to discharge.",
        tone: "warning",
      },
      {
        id: "rabies",
        title: "Luna: Annual Rabies Certificate Ready",
        description: "Doctor signature required for the updated county tag.",
        tone: "info",
      },
    ],
    entries: state.entries,
  };
}

export const getDemoOverview = cache(async () => {
  await connection();
  return overview(await readState());
});

export async function applyDemoChange(
  change: ClinicalChange,
): Promise<boolean> {
  const state = await readState();
  const current = overview(state);
  if (change.kind === "intake" || change.kind === "microchip") {
    const { chip } = change;
    const target = change.kind === "microchip" ? change.patientId : undefined;
    if (
      chip &&
      current.patients.some(
        (patient) =>
          patient.id !== target &&
          normalizeMicrochip(patient.chip ?? "") === chip,
      )
    )
      return false;
    if (change.kind === "intake") {
      const { kind: _kind, ...patient } = change;
      state.patients.push({ id: crypto.randomUUID(), ...patient });
    } else {
      const patient = current.patients.find(
        ({ id }) => id === change.patientId,
      );
      if (!patient) return false;
      if (normalizeMicrochip(patient.chip ?? "") !== chip)
        state.chips[change.patientId] = chip;
    }
  } else if (change.kind === "call") {
    const visit = current.queue.find(({ id }) => id === change.visitId);
    if (!visit || (visit.status !== "waiting" && visit.status !== "checked_in"))
      return false;
    state.called.push(visit.id);
  } else {
    if (!current.patients.some(({ id }) => id === change.patientId))
      return false;
    state.entries.push({ id: crypto.randomUUID(), ...change });
  }
  const value = JSON.stringify(state);
  if (encodeURIComponent(value).length > 3800) return false;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/clinic",
  });
  return true;
}

export async function clearClinicalDemo() {
  (await cookies()).set(COOKIE, "", { path: "/clinic", maxAge: 0 });
}
