/**
 * Converts between clinic slot times ("14:30") and the 12-hour wheel parts
 * (02 : 30 PM), and derives which values each wheel offers. Pure functions.
 */
import type { Tone } from "@/app/shared/common";
import type { TimeSlot } from "../../../_lib/data/types";

export type Period = "AM" | "PM";

export interface TimeParts {
  /** "01" … "12" */
  hour: string;
  /** "00" … "59" */
  minute: string;
  period: Period;
}

const pad = (value: number) => String(value).padStart(2, "0");

export function toParts(time: string): TimeParts {
  const [hours, minutes] = time.split(":").map(Number);
  return {
    hour: pad(hours % 12 || 12),
    minute: pad(minutes),
    period: hours < 12 ? "AM" : "PM",
  };
}

export function fromParts({ hour, minute, period }: TimeParts): string {
  const hours = (Number(hour) % 12) + (period === "PM" ? 12 : 0);
  return `${pad(hours)}:${minute}`;
}

const unique = <T>(values: T[]) => [...new Set(values)];

/**
 * Wheel values that occur in the day's slots. Hours keep chronological
 * order (09 10 11 12 01 02…), so scrolling down always means "later".
 */
export function wheelOptions(slots: TimeSlot[]) {
  const parts = [...slots]
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((slot) => toParts(slot.time));
  const toOptions = (values: string[]) =>
    values.map((value) => ({ value, label: value }));
  return {
    hours: toOptions(unique(parts.map((p) => p.hour))),
    minutes: toOptions(unique(parts.map((p) => p.minute)).sort()),
    periods: toOptions(unique(parts.map((p) => p.period))),
  };
}

export type SlotStatus = "available" | "booked" | "none";

export function slotStatus(slots: TimeSlot[], time: string): SlotStatus {
  const slot = slots.find((s) => s.time === time);
  if (!slot) return "none";
  return slot.available ? "available" : "booked";
}

/** Label and badge tone for the wheel's current combination. */
export const SLOT_STATUS: Record<SlotStatus, { label: string; tone: Tone }> = {
  available: { label: "Slot Available", tone: "success" },
  booked: { label: "Already Booked", tone: "danger" },
  none: { label: "No Slot at This Time", tone: "neutral" },
};

/** Starting position: the current choice if it is still open, else the first open slot. */
export function initialTime(slots: TimeSlot[], current: string | null): string {
  if (current && slotStatus(slots, current) === "available") return current;
  return slots.find((s) => s.available)?.time ?? slots[0]?.time ?? "09:00";
}
