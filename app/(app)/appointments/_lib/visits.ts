import { ROUTES } from "@/app/shared/config/routes";
import { isUpcoming } from "../../_lib/data/appointment-policy";
import type { AppointmentStatus } from "../../_lib/data/types";

export const VISIT_FILTERS = [
  { id: "all", label: "All Visits" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export type VisitFilter = (typeof VISIT_FILTERS)[number]["id"];

interface VisitQuery {
  filter: VisitFilter;
  petId: string;
  query: string;
  page: number;
}

type QueryParams = Record<string, string | string[] | undefined>;

export function readVisitQuery(params: QueryParams): VisitQuery {
  const filter = VISIT_FILTERS.find(({ id }) => id === params.view);
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  return {
    filter: filter?.id ?? "all",
    petId: typeof params.pet === "string" ? params.pet : "",
    query: typeof params.q === "string" ? params.q.trim().slice(0, 100) : "",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function visitListHref({ filter, petId, query, page }: VisitQuery) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("view", filter);
  if (petId) params.set("pet", petId);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${ROUTES.appointments}?${search}` : ROUTES.appointments;
}

interface VisitTiming {
  startsAt: string;
  status: AppointmentStatus;
}

type SearchableVisit = VisitTiming & {
  petId: string;
  service: string;
  description?: string;
  provider?: string | null;
};

export function selectVisits<T extends SearchableVisit>(
  visits: T[],
  { filter, petId, query, page }: VisitQuery,
  now: number,
  pageSize: number,
) {
  const needle = query.toLocaleLowerCase();
  const counts = { all: 0, upcoming: 0, completed: 0, cancelled: 0 };
  const matches = visits.filter((visit) => {
    if (petId && visit.petId !== petId) return false;
    if (
      needle &&
      ![visit.service, visit.description, visit.provider].some((value) =>
        value?.toLocaleLowerCase().includes(needle),
      )
    )
      return false;
    const upcoming = isUpcoming(visit, now);
    counts.all++;
    if (upcoming) counts.upcoming++;
    if (visit.status === "completed" || visit.status === "cancelled")
      counts[visit.status]++;
    if (filter === "all") return true;
    if (filter === "upcoming") return upcoming;
    return visit.status === filter;
  });
  matches.sort((a, b) => {
    const aUpcoming = isUpcoming(a, now);
    const bUpcoming = isUpcoming(b, now);
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    const difference = Date.parse(a.startsAt) - Date.parse(b.startsAt);
    return aUpcoming ? difference : -difference;
  });

  const pageCount = Math.ceil(matches.length / pageSize);
  const currentPage = Math.min(page, Math.max(1, pageCount));
  const offset = (currentPage - 1) * pageSize;
  return {
    rows: matches.slice(offset, offset + pageSize),
    counts,
    currentPage,
    pageCount,
    total: matches.length,
    offset,
  };
}
