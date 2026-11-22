"use client";

import { type ReactNode, useId } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { DEFAULT_LOCALE } from "../size";
import { cx } from "../utils/cx";
import { formatDate, isSameDay, toISODate } from "../utils/date";
import styles from "./DateStrip.module.css";

export interface DateStripProps {
  /** The days to offer, in display order. */
  dates: Date[];
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  /** Group label, e.g. "Choose a date". */
  label?: ReactNode;
  /** Shown on the right; defaults to the month of the selected/first date. */
  caption?: ReactNode;
  isDateDisabled?: (date: Date) => boolean;
  locale?: string;
  /** Form field name; value is YYYY-MM-DD. */
  name?: string;
  className?: string;
}

/**
 * Horizontal day selector from the moodboard ("Choose a date": Wed 21,
 * Thu 22 …). Built on native radio inputs, so arrow keys work out of the box.
 */
export function DateStrip({
  dates,
  value,
  defaultValue = null,
  onChange,
  label = "Choose a date",
  caption,
  isDateDisabled,
  locale = DEFAULT_LOCALE,
  name,
  className,
}: DateStripProps) {
  const [selected, setSelected] = useControllableState<Date | null>({
    value,
    defaultValue,
    onChange: (date) => {
      if (date) onChange?.(date);
    },
  });
  const generatedName = useId();
  const groupName = name ?? `date-strip-${generatedName}`;
  const captionDate = selected ?? dates[0];

  return (
    <fieldset className={cx(styles.strip, className)}>
      {/* <legend> must be the first child to name the group. */}
      <legend className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.caption} aria-hidden="true">
          {caption ??
            (captionDate
              ? formatDate(captionDate, locale, {
                  month: "long",
                  year: "numeric",
                })
              : null)}
        </span>
      </legend>
      <div className={styles.days}>
        {dates.map((date) => {
          const iso = toISODate(date);
          const disabled = isDateDisabled?.(date) ?? false;
          return (
            <label
              key={iso}
              className={styles.day}
              data-disabled={disabled || undefined}
            >
              <input
                type="radio"
                name={groupName}
                value={iso}
                checked={isSameDay(date, selected)}
                disabled={disabled}
                aria-label={formatDate(date, locale)}
                className={styles.input}
                onChange={() => setSelected(date)}
              />
              <span className={styles.weekday} aria-hidden="true">
                {formatDate(date, locale, { weekday: "short" })}
              </span>
              <span className={styles.date} aria-hidden="true">
                {date.getDate()}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
