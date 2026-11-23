"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { readString } from "@/app/shared/forms/form-state";
import { isDemoMode } from "@/app/shared/server/env";
import { deleteSession } from "@/app/shared/server/session";
import { updatePractice } from "./_lib/data";
import { clearClinicalDemo } from "./_lib/demo";
import type { ClinicalChange } from "./_lib/model";

export type ClinicalResult =
  | { status: "idle" | "saved" }
  | { status: "error"; message: string };

export async function saveClinicalChange(
  kind: ClinicalChange["kind"],
  id: string,
  _previous: ClinicalResult,
  data: FormData,
): Promise<ClinicalResult> {
  const value = (field: string) => readString(data, field).trim();
  let change: ClinicalChange;
  switch (kind) {
    case "intake": {
      const name = value("name");
      const owner = value("owner");
      const breed = value("breed");
      const chip = value("chip");
      if (
        !name ||
        !owner ||
        [name, owner, breed].some((field) => field.length > 100) ||
        (chip && !/^\d{9,15}$/.test(chip))
      ) {
        return {
          status: "error",
          message:
            "Enter a patient and owner name, and a valid microchip number if available.",
        };
      }
      change = { kind, name, owner, breed, chip };
      break;
    }
    case "call":
      if (!id) return { status: "error", message: "Select a visit." };
      change = { kind, visitId: id };
      break;
    case "note":
    case "prescription":
    case "lab": {
      const text = value("text");
      if (!id || !text || text.length > 1000)
        return { status: "error", message: "Enter up to 1,000 characters." };
      change = { kind, patientId: id, text };
      break;
    }
    default:
      return { status: "error", message: "This action is unavailable." };
  }
  if (!(await updatePractice(change)))
    return {
      status: "error",
      message:
        "The change couldn’t be saved. Check the details or refresh and try again.",
    };
  revalidatePath(ROUTES.clinicalDashboard);
  return { status: "saved" };
}

export async function logoutClinician() {
  if (isDemoMode()) await clearClinicalDemo();
  await deleteSession();
  redirect(ROUTES.clinicalLogin);
}
