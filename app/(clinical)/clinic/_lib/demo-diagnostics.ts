import "server-only";
import { cookies } from "next/headers";
import type { Clinician } from "@/app/shared/server/clinical-session";
import { getDemoOverview } from "./demo";
import {
  type ClinicalOrder,
  canAuthorizeRefill,
  canReleaseResult,
  type OrderCommand,
  type OrderPatient,
  type OrderQuery,
  selectDemoOrders,
} from "./diagnostics";

const COOKIE = "vv_demo_orders";
type SavedOrder = Omit<ClinicalOrder, "patient"> & { patientId: string };

const FIXTURES: SavedOrder[] = [
  {
    id: "lab-1001",
    reference: "LAB-1001",
    kind: "lab",
    patientId: "luna",
    title: "Comprehensive Serum Chemistry & CBC",
    notes: "Organ function and electrolyte screening",
    orderedAt: "2026-11-23T09:15:00Z",
    facility: "In-House Lab",
    clinician: "Dr. Sarah Jenkins",
    status: "ready",
    result: "Sample report: results within the laboratory reference intervals.",
  },
  {
    id: "rx-2001",
    reference: "RX-2001",
    kind: "prescription",
    patientId: "barnaby",
    title: "Cephalexin Oral Suspension",
    notes: "Post-operative prescription on file",
    orderedAt: "2026-11-22T11:20:00Z",
    facility: "VertiVet Pharmacy",
    clinician: "Dr. Sarah Jenkins",
    status: "active",
    refillsRemaining: 1,
  },
  {
    id: "lab-1002",
    reference: "LAB-1002",
    kind: "lab",
    patientId: "cleo",
    title: "Feline FeLV / FIV Rapid Screen",
    notes: "Pre-vaccination screening",
    orderedAt: "2026-11-23T08:45:00Z",
    facility: "Reference Laboratory",
    clinician: "Dr. Emma Wilson",
    status: "ready",
    result: "Sample report: negative screening result.",
  },
  {
    id: "img-1001",
    reference: "IMG-1001",
    kind: "imaging",
    patientId: "milo",
    title: "Dental Full-Mouth Digital X-Rays",
    notes: "Oral and dental assessment",
    orderedAt: "2026-10-02T14:40:00Z",
    facility: "Radiology Suite A",
    clinician: "Dr. Emma Wilson",
    status: "released",
    result:
      "Sample radiology report: mild gingivitis noted. Scan files are unavailable in demo mode.",
  },
  {
    id: "lab-1003",
    reference: "LAB-1003",
    kind: "lab",
    patientId: "milo",
    title: "Urinalysis",
    orderedAt: "2026-10-01T09:30:00Z",
    facility: "In-House Lab",
    clinician: "Dr. Emma Wilson",
    status: "released",
    result: "Sample report: no abnormalities noted.",
  },
];

async function savedOrders(): Promise<SavedOrder[]> {
  try {
    const data: unknown = JSON.parse(
      (await cookies()).get(COOKIE)?.value ?? "[]",
    );
    return Array.isArray(data)
      ? data.filter(
          (row) =>
            row &&
            typeof row.id === "string" &&
            typeof row.patientId === "string" &&
            typeof row.title === "string" &&
            (row.kind === "lab" ||
              row.kind === "prescription" ||
              row.kind === "imaging") &&
            [
              "draft",
              "ordered",
              "ready",
              "released",
              "active",
              "completed",
            ].includes(row.status),
        )
      : [];
  } catch {
    return [];
  }
}

async function demoData() {
  const [overview, saved] = await Promise.all([
    getDemoOverview(),
    savedOrders(),
  ]);
  const patients = new Map(
    overview.patients.map(
      ({ id, name, owner, age, species }): [string, OrderPatient] => [
        id,
        { id, name, owner, age, species },
      ],
    ),
  );
  const drafts = overview.entries.flatMap((entry): SavedOrder[] =>
    entry.kind === "note"
      ? []
      : [
          {
            id: entry.id,
            patientId: entry.patientId,
            kind: entry.kind,
            title:
              entry.kind === "lab" ? "Lab order draft" : "Prescription draft",
            notes: entry.text,
            status: "draft",
          },
        ],
  );
  const records = new Map(
    [...FIXTURES, ...drafts, ...saved].map((order) => [order.id, order]),
  );
  return { patients, saved, records };
}

function withPatient(
  order: SavedOrder,
  patients: Map<string, OrderPatient>,
): ClinicalOrder[] {
  const { patientId, ...record } = order;
  const patient = patients.get(patientId);
  return patient ? [{ ...record, patient }] : [];
}

export async function getDemoOrders(query: OrderQuery) {
  const { patients, records } = await demoData();
  return selectDemoOrders(
    [...records.values()].flatMap((order) => withPatient(order, patients)),
    [...patients.values()],
    query,
  );
}

export async function changeDemoOrder(
  command: OrderCommand,
  clinician: Clinician,
): Promise<boolean> {
  const { patients, records, saved } = await demoData();
  const name = [clinician.firstName, clinician.lastName]
    .filter(Boolean)
    .join(" ");
  const now = new Date().toISOString();
  let updated: SavedOrder;

  if (command.kind === "create_order") {
    if (!patients.has(command.patientId)) return false;
    const id = crypto.randomUUID();
    updated = {
      id,
      reference: `${command.orderKind === "lab" ? "LAB" : "RX"}-${id.slice(0, 8)}`,
      kind: command.orderKind,
      patientId: command.patientId,
      title: command.title,
      notes: command.notes,
      orderedAt: now,
      clinician: name,
      status: command.orderKind === "lab" ? "ordered" : "draft",
    };
  } else {
    const existing = records.get(command.orderId);
    const order = existing && withPatient(existing, patients)[0];
    if (!existing || !order) return false;
    if (command.kind === "release_result") {
      if (!canReleaseResult(order)) return false;
      updated = { ...existing, status: "released" };
    } else {
      if (!canAuthorizeRefill(order)) return false;
      updated = {
        ...existing,
        refillsRemaining: (existing.refillsRemaining ?? 0) - 1,
        refillLog: [
          ...(existing.refillLog ?? []),
          { id: crypto.randomUUID(), authorizedAt: now, clinician: name },
        ],
      };
    }
  }

  const value = JSON.stringify([
    ...saved.filter(({ id }) => id !== updated.id),
    updated,
  ]);
  if (encodeURIComponent(value).length > 3800) return false;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/clinic",
  });
  return true;
}

export async function clearDemoOrders() {
  (await cookies()).set(COOKIE, "", { path: "/clinic", maxAge: 0 });
}
