"use client";

import { type FormEvent, useActionState, useCallback, useState } from "react";
import type { FormMessage, FormState } from "../forms/form-state";
import { readFields } from "../forms/form-state";
import type { FieldErrors, ValidationResult } from "../forms/validation";

interface UseActionFormOptions<F extends string> {
  /** Server Action with the useActionState signature. */
  action: (state: FormState<F>, formData: FormData) => Promise<FormState<F>>;
  initialState: FormState<F>;
  /** Fields to validate on the client before submitting. */
  fields: readonly F[];
  /** The same validator the Server Action uses. */
  validate: (input: Record<F, string>) => ValidationResult<unknown, F>;
}

/**
 * Glue between a <form>, its Server Action and shared validation:
 * - validates on the client first and skips the round trip when invalid,
 * - mirrors server field/form errors into local state,
 * - lets fields clear their own error while the user types,
 * - lets the banner be dismissed until the next submission.
 */
export function useActionForm<F extends string>({
  action,
  initialState,
  fields,
  validate,
}: UseActionFormOptions<F>) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<F>>(
    state.fieldErrors ?? {},
  );
  const [formError, setFormError] = useState<FormMessage | null>(
    state.formError ?? null,
  );

  // Sync from a new server result during render (no effect, no extra paint).
  const [syncedState, setSyncedState] = useState(state);
  if (state !== syncedState) {
    setSyncedState(state);
    setFieldErrors(state.fieldErrors ?? {});
    setFormError(state.formError ?? null);
  }

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      const input = readFields(new FormData(event.currentTarget), fields);
      const result = validate(input);
      if (result.success) {
        setFieldErrors({});
        return;
      }
      // Cancelling the event stops React from invoking the action.
      event.preventDefault();
      setFieldErrors(result.fieldErrors);
      setFormError(null);
      const firstInvalid = fields.find((f) => result.fieldErrors[f]);
      if (firstInvalid) {
        event.currentTarget
          .querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
          ?.focus();
      }
    },
    [fields, validate],
  );

  const clearFieldError = useCallback((field: F) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const dismissFormError = useCallback(() => setFormError(null), []);

  return {
    state,
    formAction,
    pending,
    fieldErrors,
    formError,
    onSubmit,
    clearFieldError,
    dismissFormError,
  };
}
