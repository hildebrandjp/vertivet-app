"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { readString } from "@/app/shared/forms/form-state";
import { changeAppointment } from "../_lib/data/dal";
import type { AppointmentChange } from "../_lib/data/types";

export type VisitActionState =
  | { status: "idle" | "saved" }
  | { status: "error"; message: string };

export async function updateVisit(
  id: string,
  startsAt: string,
  kind: AppointmentChange["kind"],
  _previous: VisitActionState,
  data: FormData,
): Promise<VisitActionState> {
  let change: AppointmentChange;
  switch (kind) {
    case "confirm":
    case "cancel":
      change = { kind };
      break;
    case "reschedule": {
      const date = readString(data, "date");
      const time = readString(data, "time");
      if (!date || !time) {
        return { status: "error", message: "Choose a new date and time." };
      }
      change = { kind, date, time };
      break;
    }
    default:
      return { status: "error", message: "This action is unavailable." };
  }

  try {
    const result = await changeAppointment(id, startsAt, change);
    if (result === "changed") {
      return {
        status: "error",
        message: "This visit has changed. Refresh the list and try again.",
      };
    }
    if (result === "slot_taken") {
      return {
        status: "error",
        message: "That time is unavailable. Choose a different slot.",
      };
    }
    if (result === "saved") {
      revalidatePath(ROUTES.appointments);
      revalidatePath(ROUTES.dashboard);
      return { status: "saved" };
    }
  } catch (error) {
    unstable_rethrow(error);
    console.error("[appointments] Could not update visit.", error);
  }
  return {
    status: "error",
    message: "We couldn’t update this visit. Please try again.",
  };
}
