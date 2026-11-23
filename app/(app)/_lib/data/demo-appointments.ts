import "server-only";
import { cookies } from "next/headers";
import { demoAppointments } from "./demo-data";
import type { Appointment } from "./types";

const COOKIE_NAME = "vertivet_demo_visits";

function isSavedVisit(value: unknown): value is Appointment {
  if (!value || typeof value !== "object") return false;
  const visit = value as Partial<Appointment>;
  return (
    typeof visit.id === "string" &&
    typeof visit.petId === "string" &&
    typeof visit.service === "string" &&
    typeof visit.startsAt === "string" &&
    Number.isFinite(Date.parse(visit.startsAt)) &&
    (visit.status === "confirmed" ||
      visit.status === "pending" ||
      visit.status === "cancelled") &&
    (visit.serviceId === undefined || typeof visit.serviceId === "string") &&
    (visit.description === undefined ||
      typeof visit.description === "string") &&
    (visit.durationMinutes === undefined ||
      typeof visit.durationMinutes === "number") &&
    (visit.provider == null || typeof visit.provider === "string") &&
    (visit.location == null || typeof visit.location === "string")
  );
}

async function savedVisits(): Promise<Appointment[]> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return [];
  try {
    const decoded: unknown = JSON.parse(value);
    return Array.isArray(decoded) ? decoded.filter(isSavedVisit) : [];
  } catch {
    return [];
  }
}

export async function getDemoAppointments(): Promise<Appointment[]> {
  const visits = new Map(demoAppointments().map((visit) => [visit.id, visit]));
  for (const visit of await savedVisits()) visits.set(visit.id, visit);
  return [...visits.values()];
}

export async function saveDemoAppointment(
  visit: Appointment,
): Promise<boolean> {
  const visits = (await savedVisits()).filter(({ id }) => id !== visit.id);
  const value = JSON.stringify([...visits, visit]);
  if (encodeURIComponent(value).length > 3800) return false;
  (await cookies()).set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return true;
}
