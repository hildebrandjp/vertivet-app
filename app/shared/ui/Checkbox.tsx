"use client";

import {
  type ComponentPropsWithRef,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { cx } from "../utils/cx";
import { mergeRefs } from "../utils/refs";
import styles from "./Checkbox.module.css";
import { useFieldControl } from "./Field";
import { CheckIcon, MinusIcon } from "./icons";

export interface CheckboxProps
  extends Omit<ComponentPropsWithRef<"input">, "type" | "size"> {
  label?: ReactNode;
  /** Secondary line under the label. */
  description?: ReactNode;
  /** Mixed state, e.g. "some rows selected". */
  indeterminate?: boolean;
  size?: "sm" | "md";
}

/**
 * Selection control (08 Checkbox). A native checkbox, visually replaced,
 * so forms, keyboard and screen readers behave natively.
 * When there is no visible `label`, pass `aria-label`.
 */
export function Checkbox({
  label,
  description,
  indeterminate = false,
  size = "md",
  id,
  disabled,
  required,
  className,
  ref,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Inside a <Field>, pick up id, error state and helper/error text wiring.
  const control = useFieldControl(
    { id, disabled, required, "aria-describedby": ariaDescribedBy },
    "md",
  );

  // `indeterminate` is a DOM property only, it has no HTML attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={cx(styles.checkbox, className)}
      data-size={size}
      data-disabled={control.disabled || undefined}
    >
      <span className={styles.control}>
        <input
          {...rest}
          ref={mergeRefs(inputRef, ref)}
          id={control.id}
          type="checkbox"
          disabled={control.disabled}
          required={control.required}
          aria-invalid={control.invalid}
          aria-describedby={control.describedBy}
          className={styles.input}
        />
        <span className={styles.box} aria-hidden="true">
          <CheckIcon className={styles.check} strokeWidth={3} />
          <MinusIcon className={styles.dash} strokeWidth={3} />
        </span>
      </span>
      {label != null || description != null ? (
        <span className={styles.text}>
          {label != null ? <span className={styles.label}>{label}</span> : null}
          {description != null ? (
            <span className={styles.description}>{description}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
