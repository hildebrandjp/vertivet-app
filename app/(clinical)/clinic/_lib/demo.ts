import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { APP_TIME_ZONE } from "@/app/shared/config/locale";
import { todayInTimeZone } from "@/app/shared/utils/date";
import { type DemoWalkIn, demoSchedule, isDemoWalkIn } from "./demo-schedule";
import {
  type ClientRecord,
  type ClinicalChange,
  type ClinicalEntry,
  type ClinicalPatient,
  isClinicalSpecies,
  type PracticeOverview,
} from "./model";
import {
  groupRegistryOwners,
  normalizeMicrochip,
  registryOwnerId,
} from "./registry";
import { canCallVisit } from "./schedule";

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
  {
    id: "toby",
    name: "Toby",
    breed: "Shih Tzu",
    age: "5y",
    species: "dog",
    owner: "Maria Santos",
    ownerId: "maria",
  },
];

interface DemoState {
  patients: ClinicalPatient[];
  entries: ClinicalEntry[];
  called: string[];
  chips: Record<string, string>;
  clients: ClientRecord[];
  walkIns: DemoWalkIn[];
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
                ownerId,
              }: ClinicalPatient) => ({
                id,
                name,
                breed,
                owner,
                chip,
                species: isClinicalSpecies(species) ? species : undefined,
                ownerEmail: validText(ownerEmail) ? ownerEmail : undefined,
                ownerPhone: validText(ownerPhone) ? ownerPhone : undefined,
                ownerId: validText(ownerId) ? ownerId : undefined,
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
      clients: Array.isArray(value.clients)
        ? value.clients.filter(
            (client: ClientRecord) =>
              client &&
              [client.id, client.name].every(validText) &&
              [
                client.email,
                client.phone,
                client.address,
                client.memberId,
                client.lastConsultationAt,
              ].every((item) => item === undefined || validText(item)) &&
              (client.status === undefined ||
                client.status === "active" ||
                client.status === "inactive"),
          )
        : [],
      walkIns: Array.isArray(value.walkIns)
        ? value.walkIns.filter(isDemoWalkIn)
        : [],
      chips: Object.fromEntries(
        Object.entries(value.chips ?? {}).filter(
          (entry): entry is [string, string] =>
            typeof entry[1] === "string" && /^\d{9,15}$/.test(entry[1]),
        ),
      ),
    };
  } catch {
    return {
      patients: [],
      entries: [],
      called: [],
      chips: {},
      clients: [],
      walkIns: [],
    };
  }
}

function demoClients(state: DemoState, date: string): ClientRecord[] {
  const recorded = new Map(state.clients.map((client) => [client.id, client]));
  const recentDate = new Date(Date.parse(date) - 7 * 86_400_000).toISOString();
  const fixtures = groupRegistryOwners(PATIENTS).map(
    ({ id, name, email, phone }, index): ClientRecord => {
      const saved = recorded.get(id);
      recorded.delete(id);
      return (
        saved ?? {
          id,
          name,
          email,
          phone,
          memberId: `VR-${40912 + index}`,
          status: "active",
          ...(index < 3 && { lastConsultationAt: recentDate }),
        }
      );
    },
  );
  return [...fixtures, ...recorded.values()];
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
  const clients = new Map(state.clients.map((client) => [client.id, client]));
  const patients = [...PATIENTS, ...state.patients].map((patient) => {
    const ownerId = registryOwnerId(patient);
    const owner = clients.get(ownerId);
    return {
      ...patient,
      ownerId,
      ...(owner && {
        owner: owner.name,
        ownerEmail: owner.email,
        ownerPhone: owner.phone,
      }),
      ...(Object.hasOwn(state.chips, patient.id) && {
        chip: state.chips[patient.id],
        chipVerified: false,
      }),
    };
  });
  const date = todayInTimeZone(APP_TIME_ZONE);
  const walkIns = state.walkIns.filter((visit) => visit.date === date);
  return {
    date,
    clinicName: "VertiVet Central",
    room: "Exam Room 2",
    counts: {
      booked: 6 + walkIns.length,
      patients: patients.length,
      owners: groupRegistryOwners(patients, demoClients(state, date)).length,
      reports: 3,
    },
    patients,
    queue: [
      ...visits,
      ...walkIns.map((visit) => ({ ...visit, status: "checked_in" as const })),
    ].map((visit) => ({
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

export const getDemoPractice = cache(async () => {
  await connection();
  const state = await readState();
  const practice = overview(state);
  return {
    overview: practice,
    clients: demoClients(state, practice.date),
    walkIns: state.walkIns,
  };
});

export async function getDemoOverview() {
  return (await getDemoPractice()).overview;
}

export async function getDemoSchedule(dates: string[]) {
  const { overview: practice, walkIns } = await getDemoPractice();
  return demoSchedule(practice, dates, walkIns);
}

export async function applyDemoChange(
  change: ClinicalChange,
): Promise<boolean> {
  const state = await readState();
  const current = overview(state);
  if (change.kind === "client_intake" || change.kind === "client_update") {
    const owners = groupRegistryOwners(
      current.patients,
      demoClients(state, current.date),
    );
    const ownerId =
      change.kind === "client_update" ? change.ownerId : crypto.randomUUID();
    const existing = owners.find(({ id }) => id === ownerId);
    if (change.kind === "client_update" && !existing) return false;
    const email = change.contact.email?.toLowerCase();
    if (
      email &&
      owners.some(
        (owner) => owner.id !== ownerId && owner.email?.toLowerCase() === email,
      )
    )
      return false;
    const record = {
      id: ownerId,
      ...change.contact,
      memberId: existing?.memberId,
      lastConsultationAt: existing?.lastConsultationAt,
      status: existing?.status ?? "active",
    } as const;
    const index = state.clients.findIndex(({ id }) => id === ownerId);
    if (index < 0) state.clients.push(record);
    else state.clients[index] = record;
  } else if (change.kind === "intake" || change.kind === "microchip") {
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
      const owners = groupRegistryOwners(
        current.patients,
        demoClients(state, current.date),
      );
      const ownerId = patient.ownerEmail
        ? owners.find(
            (owner) =>
              owner.email?.toLowerCase() === patient.ownerEmail?.toLowerCase(),
          )?.id
        : undefined;
      state.patients.push({
        id: crypto.randomUUID(),
        ...patient,
        ownerId: ownerId ?? crypto.randomUUID(),
      });
    } else {
      const patient = current.patients.find(
        ({ id }) => id === change.patientId,
      );
      if (!patient) return false;
      if (normalizeMicrochip(patient.chip ?? "") !== chip)
        state.chips[change.patientId] = chip;
    }
  } else if (change.kind === "walk_in") {
    const input = change.patient;
    const patientId = "id" in input ? input.id : crypto.randomUUID();
    if ("id" in input) {
      if (!current.patients.some(({ id }) => id === patientId)) return false;
      if (current.queue.some((visit) => visit.patientId === patientId))
        return false;
    } else {
      state.patients.push({
        id: patientId,
        ownerId: crypto.randomUUID(),
        name: input.name,
        owner: input.owner,
        breed: "",
        chip: "",
      });
    }
    const startsAt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: APP_TIME_ZONE,
      hourCycle: "h23",
    }).format(new Date());
    state.walkIns.push({
      id: crypto.randomUUID(),
      patientId,
      date: current.date,
      startsAt,
      reason: change.reason,
    });
  } else if (change.kind === "call") {
    const visit = current.queue.find(({ id }) => id === change.visitId);
    if (!visit || !canCallVisit(visit.status)) return false;
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
