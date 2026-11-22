"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { Size, ValidationState } from "../common";
import { useControllableState } from "../hooks/useControllableState";
import { type DismissReason, useDismiss } from "../hooks/useDismiss";
import { DEFAULT_LOCALE, DEFAULT_SIZE } from "../size";
import { cx } from "../utils/cx";
import { formatDate, toISODate } from "../utils/date";
import { Calendar, type CalendarProps } from "./Calendar";
import controlStyles from "./Control.module.css";
import styles from "./DatePicker.module.css";
import { useFieldControl } from "./Field";
import { CalendarIcon } from "./icons";

export interface DatePickerProps
  extends Omit<CalendarProps, "autoFocus" | "className" | "onChange"> {
  onChange?: (date: Date) => void;
  placeholder?: string;
  /** Intl options for the trigger text. */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Name of a hidden input carrying YYYY-MM-DD, for native forms. */
  name?: string;
  size?: Size;
  state?: ValidationState;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/** Field-style trigger that opens a <Calendar> popover. */
export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  placeholder = "Select a date",
  formatOptions = { day: "numeric", month: "short", year: "numeric" },
  name,
  size,
  state,
  disabled,
  required,
  id,
  className,
  locale = DEFAULT_LOCALE,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ...calendarProps
}: DatePickerProps) {
  const control = useFieldControl(
    {
      id,
      size,
      state,
      disabled,
      required,
      "aria-describedby": ariaDescribedBy,
    },
    DEFAULT_SIZE,
  );
  const [selected, setSelected] = useControllableState<Date | null>({
    value,
    defaultValue,
  });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  const close = useCallback((reason?: DismissReason | "select") => {
    setOpen(false);
    if (reason !== "outside") triggerRef.current?.focus();
  }, []);

  useDismiss(rootRef, open, close);

  return (
    <div ref={rootRef} className={cx(styles.datePicker, className)}>
      <button
        ref={triggerRef}
        id={control.id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={ariaLabel}
        aria-invalid={control.invalid}
        aria-describedby={control.describedBy}
        disabled={control.disabled}
        data-size={control.size}
        data-state={control.state}
        data-focused={open || undefined}
        data-placeholder={selected ? undefined : ""}
        className={cx(controlStyles.control, controlStyles.trigger)}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={controlStyles.triggerValue}>
          {selected ? formatDate(selected, locale, formatOptions) : placeholder}
        </span>
        <CalendarIcon className={controlStyles.triggerIcon} />
      </button>

      {name ? (
        <input
          type="hidden"
          name={name}
          value={selected ? toISODate(selected) : ""}
        />
      ) : null}

      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Choose a date"
          className={styles.popover}
        >
          <Calendar
            {...calendarProps}
            locale={locale}
            value={selected}
            autoFocus
            onChange={(date) => {
              setSelected(date);
              onChange?.(date);
              close("select");
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
