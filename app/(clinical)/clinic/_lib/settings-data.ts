import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { apiRequest } from "@/app/shared/server/api-client";
import { requireClinician } from "@/app/shared/server/clinical-session";
import { readDemoSettings, storeDemoSettings } from "./demo-settings";
import type { PracticeSettings, SettingsPatch } from "./settings";

async function readLiveSettings(token: string): Promise<PracticeSettings> {
  const result = await apiRequest<PracticeSettings>("/clinical/settings", {
    token,
  });
  if (!result.ok && result.status === 401) redirect(ROUTES.clinicalLogin);
  if (!result.ok || !result.data)
    throw new Error("Could not load clinical settings.");
  return result.data;
}

export async function getClinicalSettings() {
  const session = await requireClinician();
  return {
    settings: session.demo
      ? await readDemoSettings()
      : await readLiveSettings(session.token),
    canManage: session.demo || session.clinician.role === "clinic_admin",
  };
}

export async function updateClinicalSettings(
  patch: SettingsPatch,
): Promise<PracticeSettings | null> {
  const session = await requireClinician();
  if (
    patch.operations &&
    !session.demo &&
    session.clinician.role !== "clinic_admin"
  )
    return null;
  if (session.demo) return storeDemoSettings(patch);
  // The backend scopes profile updates to the authenticated account and validates clinic entities.
  const result = await apiRequest<PracticeSettings>("/clinical/settings", {
    token: session.token,
    method: "PATCH",
    body: patch,
  });
  if (!result.ok && result.status === 401) redirect(ROUTES.clinicalLogin);
  return result.ok ? (result.data ?? readLiveSettings(session.token)) : null;
}
