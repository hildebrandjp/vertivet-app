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
  disabled,
  className,
  ref,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // `indeterminate` is a DOM property only, it has no HTML attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={cx(styles.checkbox, className)}
      data-size={size}
      data-disabled={disabled || undefined}
    >
      <span className={styles.control}>
        <input
          {...rest}
          ref={mergeRefs(inputRef, ref)}
          type="checkbox"
          disabled={disabled}
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
