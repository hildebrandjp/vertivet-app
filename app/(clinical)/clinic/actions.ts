"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { readString } from "@/app/shared/forms/form-state";
import { isEmail, isPhone } from "@/app/shared/forms/validation";
import { isDemoMode } from "@/app/shared/server/env";
import { deleteSession } from "@/app/shared/server/session";
import { updatePractice } from "./_lib/data";
import { clearClinicalDemo } from "./_lib/demo";
import { clearDemoOrders } from "./_lib/demo-diagnostics";
import { clearDemoSettings } from "./_lib/demo-settings";
import { type ClinicalChange, isClinicalSpecies } from "./_lib/model";
import { normalizeMicrochip } from "./_lib/registry";

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
    case "client_intake":
    case "client_update": {
      const name = value("name");
      const email = value("email");
      const phone = value("phone");
      const address = value("address");
      if (
        !name ||
        name.length > 100 ||
        address.length > 200 ||
        (email && (email.length > 254 || !isEmail(email))) ||
        (phone && (phone.length > 40 || !isPhone(phone))) ||
        (kind === "client_update" && !id)
      ) {
        return {
          status: "error",
          message: "Enter a client name and check the contact details.",
        };
      }
      const contact = {
        name,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
      };
      change =
        kind === "client_update"
          ? { kind, ownerId: id, contact }
          : { kind, contact };
      break;
    }
    case "intake": {
      const name = value("name");
      const owner = value("owner");
      const breed = value("breed");
      const chip = normalizeMicrochip(value("chip"));
      const species = value("species");
      const ownerEmail = value("ownerEmail");
      const ownerPhone = value("ownerPhone");
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
      if (
        (species && !isClinicalSpecies(species)) ||
        (ownerEmail && (ownerEmail.length > 254 || !isEmail(ownerEmail))) ||
        (ownerPhone && (ownerPhone.length > 40 || !isPhone(ownerPhone)))
      ) {
        return {
          status: "error",
          message:
            "Choose a valid species and check the owner’s email address and phone number.",
        };
      }
      change = {
        kind,
        name,
        owner,
        breed,
        chip,
        ...(isClinicalSpecies(species) && { species }),
        ...(ownerEmail && { ownerEmail }),
        ...(ownerPhone && { ownerPhone }),
      };
      break;
    }
    case "microchip": {
      const chip = normalizeMicrochip(value("chip"));
      if (!id || !/^\d{9,15}$/.test(chip)) {
        return {
          status: "error",
          message: "Enter a microchip number with 9 to 15 digits.",
        };
      }
      change = { kind, patientId: id, chip };
      break;
    }
    case "walk_in": {
      const patientId = value("patientId");
      const name = value("name");
      const owner = value("owner");
      const reason = value("reason");
      if (
        !reason ||
        reason.length > 160 ||
        patientId.length > 128 ||
        (!patientId &&
          (!name || !owner || name.length > 100 || owner.length > 100))
      ) {
        return {
          status: "error",
          message:
            "Choose a registered patient or enter a patient and owner name, then enter a visit reason.",
        };
      }
      change = {
        kind,
        reason,
        patient: patientId ? { id: patientId } : { name, owner },
      };
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
  if (isDemoMode())
    await Promise.all([
      clearClinicalDemo(),
      clearDemoOrders(),
      clearDemoSettings(),
    ]);
  await deleteSession();
  redirect(ROUTES.clinicalLogin);
}
