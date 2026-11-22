"use client";

import { useCallback, useState } from "react";

interface UseControllableStateOptions<T> {
  /** Controlled value. `undefined` means "uncontrolled". */
  value?: T;
  /** Initial value when uncontrolled. */
  defaultValue: T;
  onChange?: (value: T) => void;
}

/**
 * Lets a component be either controlled (`value` + `onChange`) or
 * uncontrolled (`defaultValue`) with the same code path.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>) {
  const [internal, setInternal] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, setValue] as const;
}
