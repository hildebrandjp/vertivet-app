import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { apiRequest } from "@/app/shared/server/api-client";
import { requireClinician } from "@/app/shared/server/clinical-session";
import { applyDemoChange, getDemoOverview } from "./demo";
import type { ClinicalChange, PracticeOverview } from "./model";

export async function getPractice() {
  const session = await requireClinician();
  if (session.demo)
    return {
      clinician: session.clinician,
      demo: true,
      overview: await getDemoOverview(),
    };
  const result = await apiRequest<PracticeOverview>("/clinical/overview", {
    token: session.token,
  });
  if (!result.ok && (result.status === 401 || result.status === 403))
    redirect(ROUTES.clinicalLogin);
  if (!result.ok || !result.data)
    throw new Error("Could not load the clinical overview.");
  return { clinician: session.clinician, demo: false, overview: result.data };
}

export async function updatePractice(change: ClinicalChange): Promise<boolean> {
  const session = await requireClinician();
  if (session.demo) return applyDemoChange(change);
  // The API must enforce clinic tenancy, role permissions, and state transitions.
  const result = await apiRequest("/clinical/commands", {
    token: session.token,
    method: "POST",
    body: change,
  });
  if (!result.ok && result.status === 401) redirect(ROUTES.clinicalLogin);
  return result.ok;
}
