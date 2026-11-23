"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/app/shared/config/routes";
import { type PracticeSettings, validateSettingsPatch } from "./_lib/settings";
import { updateClinicalSettings } from "./_lib/settings-data";

export async function savePracticeSettings(
  input: unknown,
): Promise<
  { ok: true; settings: PracticeSettings } | { ok: false; message: string }
> {
  const patch = validateSettingsPatch(input);
  if (typeof patch === "string") return { ok: false, message: patch };
  const settings = await updateClinicalSettings(patch);
  if (!settings)
    return {
      ok: false,
      message:
        "The settings couldn’t be saved. Check your clinic permissions or try again.",
    };
  revalidatePath(ROUTES.clinicalDashboard);
  return { ok: true, settings };
}
