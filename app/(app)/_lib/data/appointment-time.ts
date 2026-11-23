import { APP_TIME_ZONE } from "@/app/shared/config/locale";

const clinicClock = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Resolve a clinic-local calendar date and time to an instant. */
export function appointmentStart(date: string, time: string): Date | null {
  const requested = `${date}T${time}:00.000Z`;
  const target = new Date(requested);
  if (!Number.isFinite(+target) || target.toISOString() !== requested)
    return null;

  let instant = target;
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = Object.fromEntries(
      clinicClock
        .formatToParts(instant)
        .map(({ type, value }) => [type, value]),
    );
    const displayed = Date.parse(
      `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00.000Z`,
    );
    if (displayed === +target) return instant;
    instant = new Date(+instant + (+target - displayed));
  }
  return null; // The local time can be skipped during a DST transition.
}
