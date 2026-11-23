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
  fetchPetsForAction,
  fetchServicesForAction,
} from "../../_lib/data/dal";
import {
  BOOKING_ERRORS,
  BOOKING_FIELDS,
  type BookingState,
  validateBooking,
} from "./_lib/booking";

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

    return {
      ...successState(input),
      receipt: {
        id: created.id,
        status: created.status,
        bookedAt: new Date().toISOString(),
        timeZone: APP_TIME_ZONE,
        emailSent: created.emailSent,
      },
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[booking] Failed to submit appointment.", error);
    return messageErrorState(BOOKING_ERRORS.unavailable, input);
  }
}
