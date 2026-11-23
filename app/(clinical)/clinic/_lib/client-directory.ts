import type { ClientRecord, PracticeOverview } from "./model";
import {
  groupRegistryOwners,
  REGISTRY_PAGE_SIZE,
  type RegistryPage,
  type RegistryQuery,
} from "./registry";

export function selectDemoClients(
  overview: PracticeOverview,
  clients: ClientRecord[],
  query: RegistryQuery,
): RegistryPage {
  const owners = groupRegistryOwners(overview.patients, clients);
  const needle = query.query.toLowerCase();
  const digits = needle.replace(/\D/g, "");
  const matches = owners.filter(
    (owner) =>
      [owner.name, owner.phone, owner.email, ...owner.pets].some((value) =>
        value?.toLowerCase().includes(needle),
      ) ||
      (digits &&
        /^[\d\s+().-]+$/.test(needle) &&
        owner.phone?.replace(/\D/g, "").includes(digits)),
  );
  const today = Date.parse(`${overview.date}T00:00:00Z`);
  const day = 86_400_000;
  const isRecent = (owner: ClientRecord) => {
    const time = Date.parse(owner.lastConsultationAt ?? "");
    return time >= today - 29 * day && time < today + day;
  };
  const recentMatches = matches.filter(isRecent);
  const visible = query.recent ? recentMatches : matches;
  const page = Math.min(
    query.page,
    Math.max(1, Math.ceil(visible.length / REGISTRY_PAGE_SIZE)),
  );
  const offset = (page - 1) * REGISTRY_PAGE_SIZE;
  return {
    patients: [],
    entries: [],
    owners: visible.slice(offset, offset + REGISTRY_PAGE_SIZE),
    counts: { all: overview.patients.length, due: 0, owners: matches.length },
    total: visible.length,
    page,
    recentCount: recentMatches.length,
    clientSummary: {
      registered: owners.length,
      associatedPets: owners.reduce(
        (total, owner) => total + owner.pets.length,
        0,
      ),
      active: owners.filter(({ status }) => status === "active").length,
      recent: owners.filter(isRecent).length,
    },
  };
}
