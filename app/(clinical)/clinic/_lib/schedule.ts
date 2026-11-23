import { ROUTES } from "@/app/shared/config/routes";
import type {
  ClinicalEntry,
  ClinicalPatient,
  ClinicalVisit,
  QueueStatus,
} from "./model";

export interface ScheduledVisit extends Omit<ClinicalVisit, "status"> {
  status: QueueStatus | "completed";
  durationMinutes?: number;
  roomId?: string;
  detail?: string;
  sessionStartedAt?: string;
  elapsedMinutes?: number;
}

export interface ExamRoom {
  id: string;
  name: string;
  clinician?: string;
  status: "available" | "in_session" | "sterilizing";
  detail?: string;
}

export interface ScheduleDay {
  date: string;
  visits: ScheduledVisit[];
}

export interface ClinicSchedule {
  days: ScheduleDay[];
  rooms: ExamRoom[];
  patients: ClinicalPatient[];
  entries: ClinicalEntry[];
  walkInPatients?: Pick<ClinicalPatient, "id" | "name" | "owner">[];
}

export interface ScheduleQuery {
  date: string;
  mode: "day" | "week";
}

export function readScheduleQuery(
  params: Record<string, string | string[] | undefined>,
  today: string,
): ScheduleQuery {
  const value = typeof params.date === "string" ? params.date : "";
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : null;
  const date =
    parsed &&
    Number.isFinite(+parsed) &&
    parsed.toISOString().slice(0, 10) === value
      ? value
      : today;
  return { date, mode: params.period === "week" ? "week" : "day" };
}

export function shiftScheduleDate(date: string, days: number): string {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  const value = shifted.toISOString().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : date;
}

export function scheduleDates(query: ScheduleQuery): string[] {
  if (query.mode === "day") return [query.date];
  const weekday = new Date(`${query.date}T00:00:00Z`).getUTCDay();
  const monday = shiftScheduleDate(query.date, -((weekday + 6) % 7));
  return Array.from({ length: 7 }, (_, index) =>
    shiftScheduleDate(monday, index),
  );
}

export function scheduleHref(query: ScheduleQuery): string {
  const params = new URLSearchParams({ view: "queue", date: query.date });
  if (query.mode === "week") params.set("period", "week");
  return `${ROUTES.clinicalDashboard}?${params}`;
}

export const orderVisits = <T extends Pick<ScheduledVisit, "startsAt">>(
  visits: T[],
) => visits.toSorted((a, b) => a.startsAt.localeCompare(b.startsAt));

export function canCallVisit(status: ScheduledVisit["status"]): boolean {
  return status === "checked_in" || status === "waiting";
}

export function nextPatient(
  visits: ScheduledVisit[],
): ScheduledVisit | undefined {
  return orderVisits(visits).find(({ status }) => canCallVisit(status));
}

export function sessionMinutes(start: string, now: number): number | null {
  const time = Date.parse(start);
  return Number.isFinite(time)
    ? Math.max(0, Math.floor((now - time) / 60_000))
    : null;
}
