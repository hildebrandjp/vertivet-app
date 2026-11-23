import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ROUTES } from "../config/routes";
import { apiRequest } from "./api-client";
import { isDemoMode } from "./env";
import { getSessionToken } from "./session";

export interface Clinician {
  firstName: string;
  lastName: string;
  role: "veterinarian" | "clinic_staff" | "clinic_admin";
}

export const CLINICAL_DEMO_TOKEN = "vertivet-clinical-demo";

export async function lookupClinician(
  token: string,
): Promise<Clinician | null> {
  const result = await apiRequest<Clinician>("/me", { token });
  if (!result.ok) {
    if (result.failure === "unavailable" || result.failure === "rate_limited")
      throw new Error("Could not verify clinic membership.");
    return null;
  }
  const clinician = result.data;
  if (!clinician) return null;
  const { role } = clinician;
  return role === "veterinarian" ||
    role === "clinic_staff" ||
    role === "clinic_admin"
    ? clinician
    : null;
}

export type ClinicalSession =
  | { demo: true; clinician: Clinician }
  | { demo: false; token: string; clinician: Clinician };

/** Every clinical read and write must verify the session with the backend. */
export const requireClinician = cache(async (): Promise<ClinicalSession> => {
  const token = await getSessionToken();
  if (!token) redirect(ROUTES.clinicalLogin);
  if (isDemoMode() && token === CLINICAL_DEMO_TOKEN) {
    return {
      demo: true,
      clinician: {
        firstName: "Sarah",
        lastName: "Jenkins",
        role: "veterinarian",
      },
    };
  }
  const clinician = await lookupClinician(token);
  if (!clinician) redirect(ROUTES.clinicalLogin);
  return { demo: false, token, clinician };
});
