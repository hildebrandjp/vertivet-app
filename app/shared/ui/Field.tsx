"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useId,
  useMemo,
} from "react";
import type { Size, ValidationState } from "../common";
import { cx } from "../utils/cx";
import styles from "./Field.module.css";
import { CheckIcon } from "./icons";

export interface FieldContextValue {
  /** id to put on the form control so the <label> targets it. */
  controlId: string;
  /** Space-separated ids of the hint / message elements. */
  describedBy?: string;
  state: ValidationState;
  required?: boolean;
  disabled?: boolean;
  size?: Size;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** Read by controls so they wire themselves to the surrounding <Field>. */
export function useFieldContext() {
  return useContext(FieldContext);
}

interface FieldControlInput {
  id?: string;
  size?: Size;
  state?: ValidationState;
  disabled?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
}

/**
 * Merges a control's own props with the surrounding <Field> (own props win).
 * Every form control calls this so Field integration lives in one place.
 */
export function useFieldControl(props: FieldControlInput, fallbackSize: Size) {
  const field = useContext(FieldContext);
  const state = props.state ?? field?.state ?? "default";
  return {
    id: props.id ?? field?.controlId,
    size: props.size ?? field?.size ?? fallbackSize,
    state,
    disabled: props.disabled ?? field?.disabled,
    required: props.required ?? field?.required,
    describedBy: cx(field?.describedBy, props["aria-describedby"]) || undefined,
    invalid: state === "error" || undefined,
  };
}

export interface FieldProps {
  label?: ReactNode;
  /** default = sentence case; caps = small uppercase label (auth forms). */
  labelVariant?: "default" | "caps";
  /** Content at the end of the label row, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode;
  /** Helper text shown under the control. */
  hint?: ReactNode;
  /** Error message. Its presence switches the state to "error". */
  error?: ReactNode;
  /** Success message. Its presence switches the state to "valid". */
  success?: ReactNode;
  /** Force a state instead of deriving it from error/success. */
  state?: ValidationState;
  required?: boolean;
  disabled?: boolean;
  /** Default size for the control inside. */
  size?: Size;
  /** id for the control. Generated when omitted. */
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Label + control + helper/validation text. Wires up `id`, `aria-describedby`,
 * `aria-invalid`, `required`, `disabled` and state on any VertiVet control
 * placed inside it.
 */
export function Field({
  label,
  labelVariant = "default",
  labelAction,
  hint,
  error,
  success,
  state,
  required,
  disabled,
  size,
  id,
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const resolvedState: ValidationState =
    state ?? (error ? "error" : success ? "valid" : "default");

  const message =
    resolvedState === "error"
      ? error
      : resolvedState === "valid"
        ? success
        : null;
  const messageId = message ? `${controlId}-message` : undefined;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const describedBy = cx(messageId, hintId) || undefined;

  // Stable context value: consumers only re-render when something changes.
  const contextValue = useMemo<FieldContextValue>(
    () => ({
      controlId,
      describedBy,
      state: resolvedState,
      required,
      disabled,
      size,
    }),
    [controlId, describedBy, resolvedState, required, disabled, size],
  );

  return (
    <div
      className={cx(styles.field, className)}
      data-disabled={disabled || undefined}
    >
      {label || labelAction ? (
        <div className={styles.labelRow}>
          {label ? (
            <label
              htmlFor={controlId}
              className={styles.label}
              data-variant={labelVariant}
            >
              {label}
              {required ? (
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              ) : null}
            </label>
          ) : null}
          {labelAction ? (
            <span className={styles.labelAction}>{labelAction}</span>
          ) : null}
        </div>
      ) : null}

      <FieldContext.Provider value={contextValue}>
        {children}
      </FieldContext.Provider>

      {message ? (
        <p id={messageId} className={styles.message} data-state={resolvedState}>
          {resolvedState === "valid" ? (
            <CheckIcon className={styles.messageIcon} />
          ) : null}
          {message}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
