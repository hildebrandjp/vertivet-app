"use server";

import { unstable_rethrow } from "next/navigation";
import { APP_TIME_ZONE } from "@/app/shared/config/locale";
import {
  fieldErrorState,
  messageErrorState,
  readFields,
  successState,
} from "@/app/shared/forms/form-state";
import { todayInTimeZone } from "@/app/shared/utils/date";
import {
  createAppointment,
  fetchAvailableSlots,
  fetchPetsForAction,
  fetchServicesForAction,
} from "../../_lib/data/dal";
import type { TimeSlot } from "../../_lib/data/types";
import {
  BOOKING_ERRORS,
  BOOKING_FIELDS,
  type BookingState,
  DATE_PATTERN,
  validateBooking,
} from "./_lib/booking";

export type SlotsResult =
  | { ok: true; slots: TimeSlot[] }
  | { ok: false; message: string };

/** Available times for one service on one clinic-local day. */
export async function loadSlots(
  serviceId: string,
  date: string,
): Promise<SlotsResult> {
  if (!serviceId || !DATE_PATTERN.test(date)) {
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

/**
 * Confirms a booking. Re-validates everything the client checked, and that
 * the pet/service belong to this account, before calling the API.
 */
export async function bookAppointment(
  _previous: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const input = readFields(formData, BOOKING_FIELDS);
  const result = validateBooking(input);
  if (!result.success) return fieldErrorState(result.fieldErrors, input);

  const { data } = result;
  if (data.date < todayInTimeZone(APP_TIME_ZONE)) {
    return messageErrorState(BOOKING_ERRORS.past_date, input);
  }

  try {
    const [pets, services] = await Promise.all([
      fetchPetsForAction(),
      fetchServicesForAction(),
    ]);
    const known =
      pets.some((pet) => pet.id === data.petId) &&
      services.some((service) => service.id === data.serviceId);
    if (!known)
      return messageErrorState(BOOKING_ERRORS.invalid_selection, input);

    const created = await createAppointment({
      ...data,
      notes: data.notes.trim(),
    });
    if (!created.ok)
      return messageErrorState(BOOKING_ERRORS[created.reason], input);

    return successState(input);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[booking] Failed to submit appointment.", error);
    return messageErrorState(BOOKING_ERRORS.unavailable, input);
  }
}
