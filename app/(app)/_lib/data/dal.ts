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
  DEMO_PETS,
  DEMO_USER,
} from "./demo-data";
import type {
  AppNotification,
  Appointment,
  NavCounts,
  Pet,
  User,
} from "./types";

/**
 * Data Access Layer for the signed-in app: the only place that checks the
 * session and talks to the API. Every getter is wrapped in React `cache`,
 * so a value requested by several components is fetched once per request.
 * Callers must render inside <Suspense> (session reads are request-time).
 */

type Session = { token: string } | { demo: true };

export const verifySession = cache(async (): Promise<Session> => {
  if (isDemoMode()) {
    // Opt into request-time rendering like the real path does.
    await connection();
    return { demo: true };
  }
  const token = await getSessionToken();
  if (!token) redirect(ROUTES.login);
  return { token };
});

async function load<T>(path: string, demoValue: T): Promise<T> {
  const session = await verifySession();
  if ("demo" in session) return demoValue;

  const result = await apiRequest<T>(path, { token: session.token });
  if (result.ok && result.data !== null) return result.data;
  if (!result.ok && result.failure === "unauthorized") redirect(ROUTES.login);
  // Surfaces in the nearest error boundary (app/(app)/error.tsx).
  throw new Error(`Could not load ${path}`);
}

export const getCurrentUser = cache(() => load<User>("/me", DEMO_USER));

export const getPets = cache(() => load<Pet[]>("/pets", DEMO_PETS));

export const getNavCounts = cache(() =>
  load<NavCounts>("/me/counts", DEMO_NAV_COUNTS),
);

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
