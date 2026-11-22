"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { Size, ValidationState } from "../common";
import { DEFAULT_SIZE } from "../size";
import { cx } from "../utils/cx";
import styles from "./Control.module.css";
import { useFieldControl } from "./Field";

interface InputGroupContextValue {
  size: Size;
}

const InputGroupContext = createContext<InputGroupContextValue | null>(null);

export function useInputGroupContext() {
  return useContext(InputGroupContext);
}

export interface InputGroupProps {
  /** Content attached before the input, e.g. "@" or an icon. */
  startAddon?: ReactNode;
  /** Content attached after the input, e.g. ".com" or a unit. */
  endAddon?: ReactNode;
  size?: Size;
  state?: ValidationState;
  disabled?: boolean;
  className?: string;
  /** Usually a single <TextInput />. */
  children: ReactNode;
}

/**
 * Groups addons and an input inside one shared border (03 Input Group).
 *
 * @example
 * <InputGroup startAddon="@"><TextInput placeholder="care@vertivet.com" /></InputGroup>
 */
export function InputGroup({
  startAddon,
  endAddon,
  size,
  state,
  disabled,
  className,
  children,
}: InputGroupProps) {
  const control = useFieldControl({ size, state, disabled }, DEFAULT_SIZE);

  return (
    <div
      className={cx(styles.control, styles.group, className)}
      data-size={control.size}
      data-state={control.state}
      data-disabled={control.disabled || undefined}
    >
      {startAddon != null ? (
        <span className={styles.addon} data-position="start">
          {startAddon}
        </span>
      ) : null}
      <InputGroupContext.Provider value={{ size: control.size }}>
        {children}
      </InputGroupContext.Provider>
      {endAddon != null ? (
        <span className={styles.addon} data-position="end">
          {endAddon}
        </span>
      ) : null}
    </div>
  );
}
