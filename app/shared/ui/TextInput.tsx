"use client";

import type { ComponentPropsWithRef } from "react";
import type { Size, ValidationState } from "../common";
import { DEFAULT_PLACEHOLDER, DEFAULT_SIZE } from "../size";
import { cx } from "../utils/cx";
import styles from "./Control.module.css";
import { useFieldControl } from "./Field";
import { useInputGroupContext } from "./InputGroup";

export interface TextInputProps
  extends Omit<ComponentPropsWithRef<"input">, "size"> {
  size?: Size;
  /** Visual validation state. Inherited from <Field> when omitted. */
  state?: ValidationState;
}

/**
 * Single-line text input (01 Input Fields).
 * States: normal, focus, error, valid, disabled.
 */
export function TextInput({
  id,
  size,
  state,
  disabled,
  required,
  type = "text",
  placeholder = DEFAULT_PLACEHOLDER,
  className,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: TextInputProps) {
  const group = useInputGroupContext();
  const control = useFieldControl(
    {
      id,
      size: size ?? group?.size,
      state,
      disabled,
      required,
      "aria-describedby": ariaDescribedBy,
    },
    DEFAULT_SIZE,
  );

  return (
    <input
      {...rest}
      id={control.id}
      type={type}
      placeholder={placeholder}
      disabled={control.disabled}
      required={control.required}
      aria-invalid={control.invalid}
      aria-describedby={control.describedBy}
      data-size={control.size}
      data-state={group ? undefined : control.state}
      className={cx(styles.control, group && styles.grouped, className)}
    />
  );
}
