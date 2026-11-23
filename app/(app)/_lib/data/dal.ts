import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { apiRequest } from "@/app/shared/server/api-client";
import { isDemoMode } from "@/app/shared/server/env";
import { getSessionToken } from "@/app/shared/server/session";
import {
  DEMO_APPOINTMENTS,
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

export const getUpcomingAppointments = cache((limit: number) =>
  load<Appointment[]>(
    `/appointments?upcoming=true&limit=${limit}`,
    DEMO_APPOINTMENTS.slice(0, limit),
  ),
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
  const query = new URLSearchParams({ serviceId, date });
  return load(
    `/availability?${query}`,
    demoSlots(serviceId, date),
    await resolveSession(),
  );
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
  if ("demo" in session)
    return {
      ok: true,
      id: `demo_${Date.now()}`,
      status: "confirmed",
      emailSent: false,
    };

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
