"use client";

import { type FormEvent, useActionState, useCallback, useState } from "react";
import type { FormMessage, FormState } from "../forms/form-state";
import { readFields } from "../forms/form-state";
import type { FieldErrors, ValidationResult } from "../forms/validation";

/**
 * Focuses the control for `name`. Custom controls (Combobox, DatePicker)
 * submit through a hidden input, so focus its visible sibling instead.
 */
function focusField(form: HTMLFormElement, name: string) {
  const element = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
  const target =
    element?.type === "hidden"
      ? element.parentElement?.querySelector<HTMLElement>(
          'input:not([type="hidden"]), button, textarea',
        )
      : element;
  target?.focus();
}

interface UseActionFormOptions<F extends string, S extends FormState<F>> {
  /** Server Action with the useActionState signature. */
  action: (state: S, formData: FormData) => Promise<S>;
  initialState: S;
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
 * - lets the banner be dismissed until the next submission,
 * - exposes `succeeded` / `startOver` for forms that swap to a result view.
 */
export function useActionForm<
  F extends string,
  S extends FormState<F> = FormState<F>,
>({ action, initialState, fields, validate }: UseActionFormOptions<F, S>) {
  const [state, formAction, pending] = useActionState<S, FormData>(
    action,
    initialState as Awaited<S>,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<F>>(
    state.fieldErrors ?? {},
  );
  const [formError, setFormError] = useState<FormMessage | null>(
    state.formError ?? null,
  );

  const [succeeded, setSucceeded] = useState(state.status === "success");

  // Sync from a new server result during render (no effect, no extra paint).
  const [syncedState, setSyncedState] = useState(state);
  if (state !== syncedState) {
    setSyncedState(state);
    setFieldErrors(state.fieldErrors ?? {});
    setFormError(state.formError ?? null);
    setSucceeded(state.status === "success");
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
      if (firstInvalid) focusField(event.currentTarget, firstInvalid);
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
  /** Leave the success view and show the form again. */
  const startOver = useCallback(() => setSucceeded(false), []);

  return {
    state,
    formAction,
    pending,
    fieldErrors,
    formError,
    onSubmit,
    clearFieldError,
    dismissFormError,
    succeeded,
    startOver,
  };
}
