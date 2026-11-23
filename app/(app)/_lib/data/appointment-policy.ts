import type { Appointment, AppointmentChange } from "./types";

export function isUpcoming(
  visit: Pick<Appointment, "status" | "startsAt">,
  now: number,
): boolean {
  return (
    (visit.status === "confirmed" || visit.status === "pending") &&
    Date.parse(visit.startsAt) > now
  );
}

export function canChangeAppointment(
  visit: Appointment,
  kind: AppointmentChange["kind"],
  now: number,
): boolean {
  if (!isUpcoming(visit, now)) return false;

  switch (kind) {
    case "confirm":
      return visit.status === "pending";
    case "reschedule":
      return visit.status === "confirmed" && Boolean(visit.serviceId);
    case "cancel":
      return true;
  }
}
