"use client";

import { type KeyboardEvent, useEffect, useId, useRef } from "react";
import { cx } from "../utils/cx";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";
import styles from "./WheelPicker.module.css";

export interface WheelOption {
  value: string;
  label: string;
}

export interface WheelPickerProps {
  /** Column caption, e.g. "Hour". Also the slider's accessible name. */
  label: string;
  options: readonly WheelOption[];
  value: string;
  onChange: (value: string) => void;
  /** Placeholder shown above the first / below the last option. */
  emptyLabel?: string;
  className?: string;
}

const OFFSETS = [-2, -1, 0, 1, 2] as const;
/** Wheel distance (px) that moves one option. */
const WHEEL_STEP = 40;

/**
 * Vertical scroll picker: a value column with the current option boxed,
 * plus a vertical slider and up/down buttons. The slider is a native range
 * input, so keyboard, touch and screen readers work without extra code.
 * ↑/↓ move one option, Home/End jump to the ends, the mouse wheel scrolls.
 */
export function WheelPicker({
  label,
  options,
  value,
  onChange,
  emptyLabel = "--",
  className,
}: WheelPickerProps) {
  const labelId = useId();
  const columnRef = useRef<HTMLDivElement>(null);
  const found = options.findIndex((option) => option.value === value);
  const index = Math.max(0, found);
  const last = options.length - 1;

  const select = (next: number) => {
    const clamped = Math.min(last, Math.max(0, next));
    if (clamped !== index) onChange(options[clamped].value);
  };

  // Native, non-passive listener so the wheel scrolls values, not the page.
  const selectRef = useRef(select);
  const indexRef = useRef(index);
  useEffect(() => {
    selectRef.current = select;
    indexRef.current = index;
  });
  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    let accumulated = 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      accumulated += event.deltaY;
      if (Math.abs(accumulated) < WHEEL_STEP) return;
      selectRef.current(indexRef.current + Math.sign(accumulated));
      accumulated = 0;
    };
    column.addEventListener("wheel", onWheel, { passive: false });
    return () => column.removeEventListener("wheel", onWheel);
  }, []);

  // Vertical sliders invert ↑/↓ by default; make ↑ mean "earlier option".
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const moves: Record<string, number> = {
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key]);
  };

  return (
    <fieldset className={cx(styles.wheel, className)} aria-labelledby={labelId}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.body}>
        <div ref={columnRef} className={styles.values} aria-hidden="true">
          {OFFSETS.map((offset) => {
            const option = options[index + offset];
            return (
              <span
                key={offset}
                className={styles.value}
                data-distance={Math.abs(offset)}
                data-empty={option ? undefined : ""}
              >
                {option ? option.label : emptyLabel}
              </span>
            );
          })}
        </div>
        <div className={styles.rail}>
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Previous ${label.toLowerCase()}`}
            disabled={index <= 0}
            className={styles.step}
            onClick={() => select(index - 1)}
          >
            <ChevronUpIcon />
          </button>
          <input
            type="range"
            min={0}
            max={Math.max(last, 0)}
            step={1}
            value={index}
            disabled={options.length < 2}
            aria-label={label}
            aria-valuetext={options[index]?.label ?? emptyLabel}
            className={styles.slider}
            onChange={(event) => select(Number(event.target.value))}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Next ${label.toLowerCase()}`}
            disabled={index >= last}
            className={styles.step}
            onClick={() => select(index + 1)}
          >
            <ChevronDownIcon />
          </button>
        </div>
      </div>
    </fieldset>
  );
}
