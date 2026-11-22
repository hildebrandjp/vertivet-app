"use client";

import type { ComponentPropsWithRef } from "react";
import type { Size, ValidationState } from "../common";
import { DEFAULT_PLACEHOLDER, DEFAULT_SIZE } from "../size";
import { cx } from "../utils/cx";
import styles from "./Control.module.css";
import { useFieldControl } from "./Field";

export interface TextAreaProps extends ComponentPropsWithRef<"textarea"> {
  size?: Size;
  state?: ValidationState;
  /** Which directions the user may resize. */
  resize?: "none" | "vertical" | "both";
}

/** Multi-line text input (18 Text Area). */
export function TextArea({
  id,
  size,
  state,
  disabled,
  required,
  rows = 4,
  resize = "vertical",
  placeholder = DEFAULT_PLACEHOLDER,
  className,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: TextAreaProps) {
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

  return (
    <textarea
      {...rest}
      id={control.id}
      rows={rows}
      placeholder={placeholder}
      disabled={control.disabled}
      required={control.required}
      aria-invalid={control.invalid}
      aria-describedby={control.describedBy}
      data-size={control.size}
      data-state={control.state}
      data-resize={resize}
      className={cx(styles.control, styles.multiline, className)}
    />
  );
}
