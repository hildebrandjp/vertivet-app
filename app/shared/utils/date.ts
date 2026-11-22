/** Weekday a calendar week starts on: 0 = Sunday, 1 = Monday. */
export type WeekStart = 0 | 1;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Adds months, clamping the day so 31 Jan + 1 month = 28/29 Feb. */
export function addMonths(date: Date, amount: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

export function isSameDay(
  a: Date | null | undefined,
  b: Date | null | undefined,
) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Compares calendar days only (ignores time). Negative when a < b. */
export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function startOfWeek(date: Date, weekStartsOn: WeekStart): Date {
  const diff = (date.getDay() - weekStartsOn + 7) % 7;
  return addDays(startOfDay(date), -diff);
}

/** Always returns 42 days (6 weeks) so the grid height never jumps. */
export function getCalendarDays(month: Date, weekStartsOn: WeekStart): Date[] {
  const first = startOfWeek(startOfMonth(month), weekStartsOn);
  return Array.from({ length: 42 }, (_, index) => addDays(first, index));
}

/** Local-time ISO date (YYYY-MM-DD), safe for form values and data attrs. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses YYYY-MM-DD as a local date. Returns null when invalid. */
export function fromISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Weekday labels in display order, e.g. ["Mo", "Tu", ...]. */
export function getWeekdayLabels(
  locale: string,
  weekStartsOn: WeekStart,
  format: "narrow" | "short" | "long" = "short",
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: format });
  // 4 Jan 2026 is a Sunday.
  return Array.from({ length: 7 }, (_, i) =>
    formatter.format(new Date(2026, 0, 4 + weekStartsOn + i)),
  );
}

export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Whole years and months between `from` and `to` (calendar based). */
export function getAge(
  from: Date,
  to: Date,
): { years: number; months: number } {
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  months = Math.max(0, months);
  return { years: Math.floor(months / 12), months: months % 12 };
}
