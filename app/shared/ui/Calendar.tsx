"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useToday } from "../hooks/useToday";
import { DEFAULT_LOCALE } from "../size";
import { cx } from "../utils/cx";
import {
  addDays,
  addMonths,
  compareDays,
  formatDate,
  getCalendarDays,
  getWeekdayLabels,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  toISODate,
  type WeekStart,
} from "../utils/date";
import { IconButton } from "./Button";
import styles from "./Calendar.module.css";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export interface CalendarProps {
  /** Controlled selected date (`null` = none). */
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** Month shown first when there is no value. */
  defaultMonth?: Date;
  /** Earliest selectable day. */
  min?: Date;
  /** Latest selectable day. */
  max?: Date;
  /** Extra rule for unavailable days (weekends, fully booked, …). */
  isDateDisabled?: (date: Date) => boolean;
  /** 1 = Monday (default), 0 = Sunday. */
  weekStartsOn?: WeekStart;
  locale?: string;
  /** Show "Selected: Friday, 23 October 2026" under the grid. */
  showSelectedLabel?: boolean;
  /** Move focus into the grid on mount (used by DatePicker). */
  autoFocus?: boolean;
  className?: string;
}

/**
 * Month calendar (11 Date Picker, inline). Keyboard: arrows move by day/week,
 * Home/End to week edges, PageUp/PageDown by month (+Shift by year).
 */
export function Calendar({
  value,
  defaultValue = null,
  onChange,
  defaultMonth,
  min,
  max,
  isDateDisabled,
  weekStartsOn = 1,
  locale = DEFAULT_LOCALE,
  showSelectedLabel = true,
  autoFocus = false,
  className,
}: CalendarProps) {
  const [selected, setSelected] = useControllableState<Date | null>({
    value,
    defaultValue,
  });
  const today = useToday();
  const [focusedDate, setFocusedDate] = useState<Date>(
    () => selected ?? defaultMonth ?? new Date(),
  );
  const month = startOfMonth(focusedDate);

  const gridRef = useRef<HTMLTableElement>(null);
  const shouldFocusRef = useRef(autoFocus);
  const titleId = useId();

  // Follow a controlled value coming from outside. Compare by time so a new
  // Date instance with the same day doesn't reset navigation every render.
  const valueTime = value?.getTime();
  useEffect(() => {
    if (valueTime != null) setFocusedDate(new Date(valueTime));
  }, [valueTime]);

  // After keyboard navigation, move DOM focus to the new day.
  useEffect(() => {
    if (!shouldFocusRef.current) return;
    shouldFocusRef.current = false;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(
        `[data-date="${toISODate(focusedDate)}"]`,
      )
      ?.focus();
  }, [focusedDate]);

  const isDisabled = (date: Date) =>
    (min != null && compareDays(date, min) < 0) ||
    (max != null && compareDays(date, max) > 0) ||
    (isDateDisabled?.(date) ?? false);

  const select = (date: Date) => {
    if (isDisabled(date)) return;
    setSelected(date);
    setFocusedDate(date);
    onChange?.(date);
  };

  const goToMonth = (offset: number) =>
    setFocusedDate((d) => addMonths(d, offset));

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusedDate, -1),
      ArrowRight: () => addDays(focusedDate, 1),
      ArrowUp: () => addDays(focusedDate, -7),
      ArrowDown: () => addDays(focusedDate, 7),
      Home: () => startOfWeek(focusedDate, weekStartsOn),
      End: () => addDays(startOfWeek(focusedDate, weekStartsOn), 6),
      PageUp: () => addMonths(focusedDate, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focusedDate, event.shiftKey ? 12 : 1),
    };
    const next = moves[event.key];
    if (!next) return;
    event.preventDefault();
    shouldFocusRef.current = true;
    setFocusedDate(next());
  };

  const days = getCalendarDays(month, weekStartsOn);
  const weeks = Array.from({ length: 6 }, (_, i) =>
    days.slice(i * 7, i * 7 + 7),
  );
  const weekdayShort = getWeekdayLabels(locale, weekStartsOn, "short");
  const weekdayLong = getWeekdayLabels(locale, weekStartsOn, "long");

  return (
    <div className={cx(styles.calendar, className)}>
      <div className={styles.header}>
        <IconButton
          size="sm"
          label="Previous month"
          icon={<ChevronLeftIcon />}
          onClick={() => goToMonth(-1)}
        />
        <div id={titleId} className={styles.title} aria-live="polite">
          {formatDate(month, locale, { month: "long", year: "numeric" })}
        </div>
        <IconButton
          size="sm"
          label="Next month"
          icon={<ChevronRightIcon />}
          onClick={() => goToMonth(1)}
        />
      </div>

      <table ref={gridRef} aria-labelledby={titleId} className={styles.grid}>
        <thead>
          <tr>
            {weekdayShort.map((label, i) => (
              <th
                key={weekdayLong[i]}
                scope="col"
                abbr={weekdayLong[i]}
                className={styles.weekday}
              >
                {label.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={toISODate(week[0])}>
              {week.map((day) => {
                const iso = toISODate(day);
                const isSelected = isSameDay(day, selected);
                const disabled = isDisabled(day);
                return (
                  <td key={iso} className={styles.cell}>
                    <button
                      type="button"
                      data-date={iso}
                      tabIndex={isSameDay(day, focusedDate) ? 0 : -1}
                      aria-label={formatDate(day, locale)}
                      aria-pressed={isSelected}
                      aria-current={isSameDay(day, today) ? "date" : undefined}
                      aria-disabled={disabled || undefined}
                      data-outside={!isSameMonth(day, month) || undefined}
                      className={styles.day}
                      onClick={() => select(day)}
                      onKeyDown={handleKeyDown}
                    >
                      {day.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {showSelectedLabel ? (
        <p className={styles.footer} aria-live="polite">
          {selected
            ? `Selected: ${formatDate(selected, locale)}`
            : "No date selected"}
        </p>
      ) : null}
    </div>
  );
}
