import type { Pet, ServiceOffering, TimeSlot } from "../../../_lib/data/types";

/** Serializable receipt supplied by the booking action, never invented in the UI. */
export interface BookingReceipt {
  id: string;
  status: "confirmed" | "pending";
  bookedAt: string;
  timeZone: string;
  emailSent: boolean;
}

/** A frozen view of the booking used by the receipt and every export. */
export interface BookingConfirmationData extends BookingReceipt {
  pet: Pick<Pet, "name" | "breed">;
  service: Pick<ServiceOffering, "name" | "durationMinutes">;
  date: string;
  time: string;
  notes: string;
  provider?: TimeSlot["provider"];
  location?: TimeSlot["location"];
}
