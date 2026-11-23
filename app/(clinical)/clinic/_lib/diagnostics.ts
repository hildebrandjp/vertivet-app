import { ROUTES } from "@/app/shared/config/routes";
import type { ClinicalPatient } from "./model";

export const ORDER_PAGE_SIZE = 4;
export const ORDER_FILTERS = [
  ["all", "All Orders"],
  ["pending", "Pending Review"],
  ["completed", "Completed & Released"],
] as const;

export type OrderFilter = (typeof ORDER_FILTERS)[number][0];
export type OrderStatus =
  | "draft"
  | "ordered"
  | "ready"
  | "released"
  | "active"
  | "completed";
export type OrderKind = "lab" | "prescription" | "imaging";
export type OrderPatient = Pick<
  ClinicalPatient,
  "id" | "name" | "owner" | "species" | "age"
>;

export interface ClinicalOrder {
  id: string;
  reference?: string;
  kind: OrderKind;
  patient: OrderPatient;
  title: string;
  notes?: string;
  orderedAt?: string;
  facility?: string;
  clinician?: string;
  status: OrderStatus;
  result?: string;
  scanUrl?: string;
  refillsRemaining?: number;
  refillLog?: { id: string; authorizedAt: string; clinician: string }[];
}

export interface OrderQuery {
  filter: OrderFilter;
  query: string;
  page: number;
}

export interface OrdersPage {
  orders: ClinicalOrder[];
  orderablePatients: OrderPatient[];
  counts: Record<OrderFilter, number>;
  summary: {
    pendingLab: number;
    activeRx: number;
    dispensed: number;
    released: number;
  };
  page: number;
  total: number;
}

export type OrderCommand =
  | {
      kind: "create_order";
      orderKind: "lab" | "prescription";
      patientId: string;
      title: string;
      notes: string;
    }
  | { kind: "release_result" | "authorize_refill"; orderId: string };

export function readOrderQuery(
  params: Record<string, string | string[] | undefined>,
): OrderQuery {
  const raw = params.page;
  const page = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : 1;
  return {
    filter:
      ORDER_FILTERS.find(([filter]) => filter === params.orders)?.[0] ?? "all",
    query: typeof params.q === "string" ? params.q.trim().slice(0, 100) : "",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function orderHref({ filter, query, page }: OrderQuery): string {
  const params = new URLSearchParams({ view: "diagnostics" });
  if (filter !== "all") params.set("orders", filter);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  return `${ROUTES.clinicalDashboard}?${params}`;
}

export function canReleaseResult(order: ClinicalOrder): boolean {
  return (
    order.kind !== "prescription" &&
    order.status === "ready" &&
    Boolean(order.result?.trim())
  );
}

export function canAuthorizeRefill(order: ClinicalOrder): boolean {
  return (
    order.kind === "prescription" &&
    order.status === "active" &&
    Number.isSafeInteger(order.refillsRemaining) &&
    (order.refillsRemaining ?? 0) > 0
  );
}

export function scanLink(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

const isCompleted = (order: ClinicalOrder) =>
  order.status === "completed" ||
  order.status === "released" ||
  order.status === "active";

export function selectDemoOrders(
  orders: ClinicalOrder[],
  orderablePatients: OrderPatient[],
  query: OrderQuery,
): OrdersPage {
  const needle = query.query.toLowerCase();
  const matches = orders.filter((order) =>
    [
      order.title,
      order.reference,
      order.id,
      order.patient.name,
      order.patient.owner,
    ].some((value) => value?.toLowerCase().includes(needle)),
  );
  const pending = matches.filter(({ status }) => status === "ready");
  const completed = matches.filter(isCompleted);
  const visible =
    query.filter === "pending"
      ? pending
      : query.filter === "completed"
        ? completed
        : matches;
  const page = Math.min(
    query.page,
    Math.max(1, Math.ceil(visible.length / ORDER_PAGE_SIZE)),
  );
  const offset = (page - 1) * ORDER_PAGE_SIZE;
  return {
    orders: visible
      .toSorted((a, b) => (b.orderedAt ?? "").localeCompare(a.orderedAt ?? ""))
      .slice(offset, offset + ORDER_PAGE_SIZE),
    orderablePatients,
    counts: {
      all: matches.length,
      pending: pending.length,
      completed: completed.length,
    },
    summary: {
      pendingLab: orders.filter(
        ({ kind, status }) => kind !== "prescription" && status === "ready",
      ).length,
      activeRx: orders.filter(
        ({ kind, status }) => kind === "prescription" && status === "active",
      ).length,
      dispensed: orders.filter(
        (order) => order.kind === "prescription" && isCompleted(order),
      ).length,
      released: orders.filter(({ status }) => status === "released").length,
    },
    page,
    total: visible.length,
  };
}
