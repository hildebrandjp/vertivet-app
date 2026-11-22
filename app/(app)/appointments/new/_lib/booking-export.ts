import type { BookingConfirmationData } from "./confirmation";

/** RFC 5545 TEXT escaping prevents notes from injecting extra event fields. */
export function escapeCalendarText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/** Content lines are limited to 75 UTF-8 octets, without splitting a character. */
function foldCalendarLine(line: string): string {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let part = "";
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      lines.push(part);
      part = " ";
      bytes = 1;
    }
    part += character;
    bytes += size;
  }
  return [...lines, part].join("\r\n");
}

/** Keep clinic wall time in its named zone; never interpret it as browser time. */
export function createBookingCalendar(data: BookingConfirmationData): string {
  const start = `${data.date.replaceAll("-", "")}T${data.time.replace(":", "")}00`;
  const utc = data.timeZone === "UTC";
  const description = [
    `Patient: ${data.pet.name} (${data.pet.breed})`,
    data.provider ? `Clinician: ${data.provider}` : "",
    data.id ? `Booking ID: ${data.id}` : "",
    "Please arrive 15 minutes early and bring vaccination records.",
    data.notes ? `Notes: ${data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VertiVet//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escapeCalendarText(data.id || `${data.date}-${data.time}-${data.bookedAt}`)}@vertivet`,
    `DTSTAMP:${data.bookedAt.replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    utc ? `DTSTART:${start}Z` : `DTSTART;TZID=${data.timeZone}:${start}`,
    `DURATION:PT${data.service.durationMinutes}M`,
    `SUMMARY:${escapeCalendarText(`${data.pet.name} — ${data.service.name}`)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    ...(data.location ? [`LOCATION:${escapeCalendarText(data.location)}`] : []),
    `STATUS:${data.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(foldCalendarLine)
    .join("\r\n");
}

export function downloadBookingFile(
  contents: string,
  type: string,
  filename: string,
) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
