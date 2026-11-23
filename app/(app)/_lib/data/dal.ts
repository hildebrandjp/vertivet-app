import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { apiRequest } from "@/app/shared/server/api-client";
import { isDemoMode } from "@/app/shared/server/env";
import { getSessionToken } from "@/app/shared/server/session";
import { canChangeAppointment, isUpcoming } from "./appointment-policy";
import { appointmentStart } from "./appointment-time";
import { getDemoAppointments, saveDemoAppointment } from "./demo-appointments";
import {
  DEMO_NAV_COUNTS,
  DEMO_NOTIFICATIONS,
  DEMO_SERVICES,
  DEMO_USER,
  demoSlots,
} from "./demo-data";
import { addDemoPet, getDemoPets } from "./demo-pets";
import type {
  AppNotification,
  Appointment,
  AppointmentChange,
  NavCounts,
  NewAppointment,
  NewPet,
  Pet,
  ServiceOffering,
  TimeSlot,
  User,
} from "./types";

/**
 * Data Access Layer for the signed-in app: the only place that checks the
 * session and talks to the API. Every getter is wrapped in React `cache`,
 * so a value requested by several components is fetched once per request.
 * Callers must render inside <Suspense> (session reads are request-time).
 */

type Session = { token: string } | { demo: true };

/** Session lookup usable anywhere on the server (renders and actions). */
async function resolveSession(): Promise<Session> {
  if (isDemoMode()) return { demo: true };
  const token = await getSessionToken();
  if (!token) redirect(ROUTES.login);
  return { token };
}

/** For rendering: also opts demo mode into request-time rendering. */
export const verifySession = cache(async (): Promise<Session> => {
  if (isDemoMode()) await connection();
  return resolveSession();
});

async function load<T>(
  path: string,
  demoValue: T,
  session?: Session,
): Promise<T> {
  const active = session ?? (await verifySession());
  if ("demo" in active) return demoValue;

  const result = await apiRequest<T>(path, { token: active.token });
  if (result.ok && result.data !== null) return result.data;
  if (!result.ok && result.failure === "unauthorized") redirect(ROUTES.login);
  // Surfaces in the nearest error boundary (app/(app)/error.tsx).
  throw new Error(`Could not load ${path}`);
}

export const getCurrentUser = cache(() => load<User>("/me", DEMO_USER));

async function loadPets(session: Session): Promise<Pet[]> {
  return "demo" in session ? getDemoPets() : load<Pet[]>("/pets", [], session);
}

export const getPets = cache(async () => loadPets(await verifySession()));

export const getNavCounts = cache(async (): Promise<NavCounts> => {
  const session = await verifySession();
  if ("demo" in session) {
    return { ...DEMO_NAV_COUNTS, pets: (await getPets()).length };
  }
  return load<NavCounts>("/me/counts", DEMO_NAV_COUNTS, session);
});

export const getNotifications = cache(() =>
  load<AppNotification[]>("/notifications?limit=10", DEMO_NOTIFICATIONS),
);

async function loadAppointments(session: Session, query = "") {
  if ("demo" in session) return getDemoAppointments();
  return load<Appointment[]>(`/appointments${query}`, [], session);
}

export const getUpcomingAppointments = cache(async (limit: number) => {
  const session = await verifySession();
  const visits = await loadAppointments(
    session,
    `?upcoming=true&limit=${limit}`,
  );
  if (!("demo" in session)) return visits;
  const now = Date.now();
  return visits
    .filter((visit) => isUpcoming(visit, now))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, limit);
});

export const getAppointments = cache(async () =>
  loadAppointments(await verifySession()),
);

export interface UpcomingVisit extends Appointment {
  pet: Pet | null;
}

/** Upcoming appointments joined with their pets (both fetched in parallel). */
export const getUpcomingVisits = cache(
  async (limit: number): Promise<UpcomingVisit[]> => {
    const [appointments, pets] = await Promise.all([
      getUpcomingAppointments(limit),
      getPets(),
    ]);
    const petsById = new Map(pets.map((pet) => [pet.id, pet]));
    return appointments.map((appointment) => ({
      ...appointment,
      pet: petsById.get(appointment.petId) ?? null,
    }));
  },
);

export const getServices = cache(() =>
  load<ServiceOffering[]>("/services", DEMO_SERVICES),
);

/*
 * Server Action helpers below: Server Actions are not a render pass, so
 * they resolve the session directly instead of via verifySession().
 */

export async function fetchServicesForAction(): Promise<ServiceOffering[]> {
  return load("/services", DEMO_SERVICES, await resolveSession());
}

export async function fetchPetsForAction(): Promise<Pet[]> {
  return loadPets(await resolveSession());
}

export async function fetchAvailableSlots(
  serviceId: string,
  date: string,
): Promise<TimeSlot[]> {
  return loadAvailableSlots(serviceId, date, await resolveSession());
}

export type CreateAppointmentResult =
  | {
      ok: true;
      id: string;
      status: "confirmed" | "pending";
      emailSent: boolean;
    }
  | { ok: false; reason: "slot_taken" | "rejected" | "unavailable" };

export async function createAppointment(
  input: NewAppointment,
): Promise<CreateAppointmentResult> {
  const session = await resolveSession();
  if ("demo" in session) {
    const service = DEMO_SERVICES.find(({ id }) => id === input.serviceId);
    if (!service) return { ok: false, reason: "rejected" };
    const schedule = await findSchedule(
      service.id,
      input.date,
      input.time,
      session,
    );
    if (!schedule) return { ok: false, reason: "slot_taken" };
    const id = crypto.randomUUID();
    const saved = await saveDemoAppointment({
      id,
      petId: input.petId,
      service: service.name,
      serviceId: service.id,
      description: service.description,
      durationMinutes: service.durationMinutes,
      status: "confirmed",
      ...schedule,
    });
    return saved
      ? { ok: true, id, status: "confirmed", emailSent: false }
      : { ok: false, reason: "unavailable" };
  }

  const result = await apiRequest<{
    id?: string;
    status?: "confirmed" | "pending";
    emailSent?: boolean;
  }>("/appointments", {
    method: "POST",
    body: input,
    token: session.token,
  });
  if (result.ok)
    return {
      ok: true,
      id: result.data?.id ?? "",
      status: result.data?.status === "confirmed" ? "confirmed" : "pending",
      emailSent: result.data?.emailSent === true,
    };
  if (result.failure === "unauthorized") redirect(ROUTES.login);
  if (result.status === 409) return { ok: false, reason: "slot_taken" };
  return {
    ok: false,
    reason: result.failure === "rejected" ? "rejected" : "unavailable",
  };
}

async function loadAvailableSlots(
  serviceId: string,
  date: string,
  session: Session,
) {
  const query = new URLSearchParams({ serviceId, date });
  if (!("demo" in session))
    return load<TimeSlot[]>(`/availability?${query}`, [], session);

  const visits = await getDemoAppointments();
  const now = Date.now();
  return demoSlots(serviceId, date).map((slot) => {
    const start = appointmentStart(date, slot.time);
    const available =
      slot.available &&
      start !== null &&
      +start > now &&
      !visits.some(
        (visit) =>
          isUpcoming(visit, now) &&
          Date.parse(visit.startsAt) === +start &&
          visit.provider === slot.provider,
      );
    return { ...slot, available };
  });
}

async function findSchedule(
  serviceId: string,
  date: string,
  time: string,
  session: Session,
) {
  const start = appointmentStart(date, time);
  if (!start || +start <= Date.now()) return null;
  const slots = await loadAvailableSlots(serviceId, date, session);
  const slot = slots.find((item) => item.available && item.time === time);
  if (!slot) return null;
  return {
    startsAt: start.toISOString(),
    provider: slot.provider,
    location: slot.location,
  };
}

export async function changeAppointment(
  id: string,
  expectedStartsAt: string,
  change: AppointmentChange,
) {
  const session = await resolveSession();
  const visits = await loadAppointments(session);
  const visit = visits.find((item) => item.id === id);
  if (
    !visit ||
    visit.startsAt !== expectedStartsAt ||
    !canChangeAppointment(visit, change.kind, Date.now())
  )
    return "changed";

  const status = change.kind === "cancel" ? "cancelled" : "confirmed";
  let schedule: Awaited<ReturnType<typeof findSchedule>> = null;
  if (change.kind === "reschedule") {
    if (!visit.serviceId) return "changed";
    schedule = await findSchedule(
      visit.serviceId,
      change.date,
      change.time,
      session,
    );
    if (!schedule) return "slot_taken";
  }

  if ("demo" in session) {
    const saved = await saveDemoAppointment({ ...visit, status, ...schedule });
    return saved ? "saved" : "failed";
  }
  const body =
    change.kind === "reschedule"
      ? { date: change.date, time: change.time }
      : { status };
  const result = await apiRequest(`/appointments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
    token: session.token,
  });
  if (result.ok) return "saved";
  if (result.failure === "unauthorized") redirect(ROUTES.login);
  if (result.status === 409)
    return change.kind === "reschedule" ? "slot_taken" : "changed";
  return "failed";
}

export async function createPet(
  input: NewPet,
): Promise<"saved" | "limited" | "failed"> {
  const session = await resolveSession();
  if ("demo" in session) return (await addDemoPet(input)) ? "saved" : "limited";

  const result = await apiRequest("/pets", {
    method: "POST",
    body: input,
    token: session.token,
  });
  if (result.ok) return "saved";
  if (result.failure === "unauthorized") redirect(ROUTES.login);
  return "failed";
}
