import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { APP_TIME_ZONE } from "@/app/shared/config/locale";
import { todayInTimeZone } from "@/app/shared/utils/date";
import type {
  ClinicalChange,
  ClinicalEntry,
  ClinicalPatient,
  PracticeOverview,
} from "./model";

const COOKIE = "vv_clinical_demo";
const PATIENTS: ClinicalPatient[] = [
  {
    id: "luna",
    name: "Luna",
    breed: "Golden Retriever",
    age: "3y",
    owner: "Alex Rivers",
    chip: "900100000001",
    vitals: { weightKg: 28.4, temperatureF: 101.4, heartRate: 82 },
  },
  {
    id: "barnaby",
    name: "Barnaby",
    breed: "French Bulldog",
    age: "4y",
    owner: "Claire DuPont",
    chip: "900100000002",
  },
  {
    id: "cleo",
    name: "Cleo",
    breed: "Siamese Cat",
    age: "1y",
    owner: "Marcus Vance",
    chip: "900100000003",
  },
  {
    id: "milo",
    name: "Milo",
    breed: "Domestic Shorthair",
    age: "2y",
    owner: "Alex Rivers",
    chip: "900100000004",
  },
];

interface DemoState {
  patients: ClinicalPatient[];
  entries: ClinicalEntry[];
  called: string[];
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
            .map(({ id, name, breed, owner, chip }: ClinicalPatient) => ({
              id,
              name,
              breed,
              owner,
              chip,
            }))
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
    };
  } catch {
    return { patients: [], entries: [], called: [] };
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
  return {
    date: todayInTimeZone(APP_TIME_ZONE),
    clinicName: "VertiVet Central",
    room: "Exam Room 2",
    counts: {
      booked: 6,
      patients: 128 + state.patients.length,
      owners:
        94 +
        new Set(
          state.patients
            .map(({ owner }) => owner)
            .filter((owner) => !PATIENTS.some((p) => p.owner === owner)),
        ).size,
      reports: 3,
    },
    patients: [...PATIENTS, ...state.patients],
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

export async function getDemoOverview() {
  await connection();
  return overview(await readState());
}

export async function applyDemoChange(
  change: ClinicalChange,
): Promise<boolean> {
  const state = await readState();
  const current = overview(state);
  if (change.kind === "intake") {
    const { name, owner, breed, chip } = change;
    if (chip && current.patients.some((patient) => patient.chip === chip))
      return false;
    state.patients.push({ id: crypto.randomUUID(), name, owner, breed, chip });
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
