"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/app/shared/config/routes";
import { readBoolean, readFields } from "@/app/shared/forms/form-state";
import type { FieldErrors } from "@/app/shared/forms/validation";
import { isDemoMode } from "@/app/shared/server/env";
import { updateOwnerSettings } from "../_lib/data/dal";
import type { OwnerSettings } from "../_lib/data/settings-types";
import {
  CONTACT_NAMES,
  type ContactField,
  DEMO_PHOTO_LIMIT,
  PHOTO_LIMIT,
  PHOTO_TYPES,
  validateContact,
} from "./_lib/settings-form";

export type SaveSettingsResult =
  | { ok: true; settings: OwnerSettings }
  | { ok: false; message: string; fields?: FieldErrors<ContactField> };

async function validPhoto(photo: File, demo: boolean) {
  if (
    demo
      ? photo.type !== "image/jpeg" || photo.size > DEMO_PHOTO_LIMIT
      : !PHOTO_TYPES.includes(photo.type) || photo.size > PHOTO_LIMIT
  )
    return false;
  const bytes = new Uint8Array(await photo.slice(0, 12).arrayBuffer());
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((byte, index) => bytes[index + offset] === byte);
  switch (photo.type) {
    case "image/jpeg":
      return startsWith([0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWith([137, 80, 78, 71, 13, 10, 26, 10]);
    case "image/webp":
      return startsWith([82, 73, 70, 70]) && startsWith([87, 69, 66, 80], 8);
    default:
      return false;
  }
}

export async function saveSettings(
  formData: FormData,
): Promise<SaveSettingsResult> {
  const values = readFields(formData, CONTACT_NAMES);
  for (const field of CONTACT_NAMES) values[field] = values[field].trim();
  const result = validateContact(values);
  if (!result.success) {
    return {
      ok: false,
      message: "Check the highlighted fields and try again.",
      fields: result.fieldErrors,
    };
  }
  const entry = formData.get("photo");
  let photo: File | undefined;
  if (entry !== null) {
    if (!(entry instanceof File) || !(await validPhoto(entry, isDemoMode()))) {
      return {
        ok: false,
        message: "Choose a supported photo within the upload limit.",
      };
    }
    photo = entry;
  }
  const updated = await updateOwnerSettings(
    {
      ...result.data,
      visitReminders: readBoolean(formData, "visitReminders"),
      vaccinationAlerts: readBoolean(formData, "vaccinationAlerts"),
    },
    photo,
  );
  if (!updated)
    return { ok: false, message: "Your changes couldn’t be saved. Try again." };

  revalidatePath(ROUTES.settings);
  revalidatePath(ROUTES.dashboard);
  return { ok: true, settings: updated };
}
