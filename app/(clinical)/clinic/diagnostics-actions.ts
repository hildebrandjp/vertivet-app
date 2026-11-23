"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/app/shared/config/routes";
import { readString } from "@/app/shared/forms/form-state";
import type { OrderCommand } from "./_lib/diagnostics";
import { updateOrder } from "./_lib/diagnostics-data";
import type { ClinicalResult } from "./actions";

export async function saveOrder(
  kind: OrderCommand["kind"],
  id: string,
  _previous: ClinicalResult,
  form: FormData,
): Promise<ClinicalResult> {
  const value = (field: string) => readString(form, field).trim();
  let command: OrderCommand;
  switch (kind) {
    case "create_order": {
      const orderKind = value("orderKind");
      const title = value("title");
      const patientId = value("patientId");
      const notes = value("notes");
      if (
        (orderKind !== "lab" && orderKind !== "prescription") ||
        !title ||
        title.length > 160 ||
        !patientId ||
        patientId.length > 128 ||
        notes.length > 1000
      ) {
        return {
          status: "error",
          message:
            "Choose a patient and enter a test or medication name. Keep instructions under 1,000 characters.",
        };
      }
      command = { kind, orderKind, title, patientId, notes };
      break;
    }
    case "release_result":
    case "authorize_refill":
      if (!id || id.length > 128)
        return { status: "error", message: "Choose an order." };
      command = { kind, orderId: id };
      break;
    default:
      return { status: "error", message: "This action is unavailable." };
  }
  if (!(await updateOrder(command))) {
    return {
      status: "error",
      message:
        "This change couldn’t be saved. Check your permissions or refresh the order and try again.",
    };
  }
  revalidatePath(ROUTES.clinicalDashboard);
  return { status: "saved" };
}
