"use server";

import { unstable_rethrow } from "next/navigation";
import { appointmentStart } from "../_lib/data/appointment-time";
import { fetchAvailableSlots } from "../_lib/data/dal";
import type { TimeSlot } from "../_lib/data/types";

export type SlotsResult =
  | { ok: true; slots: TimeSlot[] }
  | { ok: false; message: string };

/** Available times for one service on one clinic-local day. */
export async function loadSlots(
  serviceId: string,
  date: string,
): Promise<SlotsResult> {
  if (!serviceId || !appointmentStart(date, "12:00")) {
    return { ok: false, message: "Pick a service and a valid date." };
  }
  try {
    return { ok: true, slots: await fetchAvailableSlots(serviceId, date) };
  } catch (error) {
    unstable_rethrow(error); // keep redirects (expired session) working
    console.error("[booking] Failed to load slots.", error);
    return {
      ok: false,
      message: "We couldn't load available times. Please try again.",
    };
  }
}
