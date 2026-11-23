import { ROUTES } from "@/app/shared/config/routes";
import {
  type ClientRecord,
  type ClinicalEntry,
  type ClinicalPatient,
  type ClinicalSpecies,
  isClinicalSpecies,
  type PracticeOverview,
} from "./model";

export const REGISTRY_PAGE_SIZE = 6;

export const SPECIES_LABELS: Record<ClinicalSpecies, string> = {
  dog: "Dog",
  cat: "Cat",
  rabbit: "Rabbit",
  bird: "Bird",
  other: "Other",
};

export interface RegistryQuery {
  tab: "all" | "due" | "owners";
  species?: ClinicalSpecies;
  query: string;
  page: number;
  recent?: boolean;
}

export interface RegistryOwner extends ClientRecord {
  pets: string[];
}

export interface ClientSummary {
  registered: number;
  associatedPets: number;
  active?: number;
  recent?: number;
}

export interface RegistryPage {
  patients: ClinicalPatient[];
  owners: RegistryOwner[];
  entries: ClinicalEntry[];
  counts: Record<RegistryQuery["tab"], number>;
  total: number;
  clientSummary?: ClientSummary;
  recentCount?: number;
  page: number;
}

export function readRegistryQuery(
  params: Record<string, string | string[] | undefined>,
): RegistryQuery {
  const page =
    typeof params.page === "string" && /^\d+$/.test(params.page)
      ? Number(params.page)
      : 1;
  return {
    tab:
      params.view === "owners"
        ? "owners"
        : params.tab === "due"
          ? "due"
          : "all",
    ...(params.view === "owners" && params.recent === "1" && { recent: true }),
    species: isClinicalSpecies(params.species) ? params.species : undefined,
    query: typeof params.q === "string" ? params.q.trim().slice(0, 100) : "",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function registryHref({
  tab,
  species,
  query,
  page,
  recent,
}: RegistryQuery) {
  const params = new URLSearchParams({
    view: tab === "owners" ? "owners" : "patients",
  });
  if (tab === "owners" && recent) params.set("recent", "1");
  if (tab === "due") params.set("tab", "due");
  if (species && tab !== "owners") params.set("species", species);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  return `${ROUTES.clinicalDashboard}?${params}`;
}

/** Match microchip numbers independently of their display separators. */
export function normalizeMicrochip(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export function registryOwnerId(patient: ClinicalPatient): string {
  return (
    patient.ownerId ??
    JSON.stringify([
      patient.owner.toLowerCase(),
      patient.ownerEmail?.toLowerCase(),
      patient.ownerPhone,
    ])
  );
}

export function groupRegistryOwners(
  patients: ClinicalPatient[],
  clients: ClientRecord[] = [],
): RegistryOwner[] {
  const owners = new Map<string, RegistryOwner>(
    clients.map((owner) => [owner.id, { ...owner, pets: [] }]),
  );
  const clientIds = new Set(clients.map(({ id }) => id));
  for (const patient of patients) {
    const id = registryOwnerId(patient);
    const owner = owners.get(id) ?? { id, name: patient.owner, pets: [] };
    if (!clientIds.has(id)) {
      owner.email ||= patient.ownerEmail;
      owner.phone ||= patient.ownerPhone;
    }
    owner.pets.push(patient.name);
    owners.set(id, owner);
  }
  return [...owners.values()];
}

export function selectDemoRegistry(
  overview: PracticeOverview,
  query: RegistryQuery,
): RegistryPage {
  const needle = query.query.toLowerCase();
  const chip = normalizeMicrochip(needle);
  const patients = overview.patients.filter((patient) => {
    if (query.species && patient.species !== query.species) return false;
    return (
      !needle ||
      [patient.name, patient.owner, patient.ownerEmail].some((value) =>
        value?.toLowerCase().includes(needle),
      ) ||
      (/^\d+$/.test(chip) &&
        normalizeMicrochip(patient.chip ?? "").includes(chip))
    );
  });
  const owners = groupRegistryOwners(patients);
  const due = patients.filter(
    ({ vaccination }) =>
      vaccination?.status === "due" || vaccination?.status === "overdue",
  );
  const visiblePatients = query.tab === "due" ? due : patients;
  const total = query.tab === "owners" ? owners.length : visiblePatients.length;
  const page = Math.min(
    query.page,
    Math.max(1, Math.ceil(total / REGISTRY_PAGE_SIZE)),
  );
  const offset = (page - 1) * REGISTRY_PAGE_SIZE;
  const patientRows =
    query.tab === "owners"
      ? []
      : visiblePatients.slice(offset, offset + REGISTRY_PAGE_SIZE);
  const ids = new Set(patientRows.map(({ id }) => id));

  return {
    patients: patientRows,
    owners:
      query.tab === "owners"
        ? owners.slice(offset, offset + REGISTRY_PAGE_SIZE)
        : [],
    entries: overview.entries.filter(({ patientId }) => ids.has(patientId)),
    counts: { all: patients.length, due: due.length, owners: owners.length },
    total,
    page,
  };
}

export function directoryCsv(owners: RegistryOwner[]): string {
  // Spreadsheet programs can evaluate a quoted cell as a formula.
  const cell = (value: string) => {
    const safe = /^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/u.test(value)
      ? `'${value}`
      : value;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const rows = owners.map(({ name, email, phone, pets }) => [
    name,
    email ?? "",
    phone ?? "",
    pets.join("; "),
  ]);
  return [["Owner", "Email", "Phone", "Patients"], ...rows, []]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}
