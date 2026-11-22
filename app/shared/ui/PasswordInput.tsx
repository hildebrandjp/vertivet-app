"use client";

import { useId, useState } from "react";
import { cx } from "../utils/cx";
import styles from "./Control.module.css";
import { useFieldContext } from "./Field";
import { EyeIcon, EyeOffIcon } from "./icons";
import { TextInput, type TextInputProps } from "./TextInput";

export interface PasswordInputProps extends Omit<TextInputProps, "type"> {
  /** Accessible labels for the visibility toggle. */
  showLabel?: string;
  hideLabel?: string;
}

/**
 * Password field with a show/hide toggle. Composes <TextInput>, so it
 * inherits sizes, validation states and <Field> wiring.
 */
export function PasswordInput({
  id,
  className,
  disabled,
  showLabel = "Show password",
  hideLabel = "Hide password",
  placeholder = "••••••••••••",
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const field = useFieldContext();
  const generatedId = useId();
  const inputId = id ?? field?.controlId ?? `password-${generatedId}`;
  const isDisabled = disabled ?? field?.disabled;

  return (
    <div className={cx(styles.affixWrapper, className)}>
      <TextInput
        {...rest}
        id={inputId}
        type={visible ? "text" : "password"}
        disabled={isDisabled}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        type="button"
        className={styles.affixButton}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        aria-controls={inputId}
        disabled={isDisabled}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
