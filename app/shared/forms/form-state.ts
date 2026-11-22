import type { FieldErrors } from "./validation";

/** Banner-level error (not tied to one field), e.g. invalid credentials. */
export interface FormMessage {
  title: string;
  message: string;
}

/**
 * Serializable result of a form Server Action, consumed by useActionForm.
 * `values` echoes safe fields back so the form can re-fill after a reset
 * (never include secrets such as passwords).
 */
export interface FormState<F extends string> {
  status: "idle" | "error" | "success";
  fieldErrors?: FieldErrors<F>;
  formError?: FormMessage | null;
  values?: Partial<Record<F, string>>;
}

type Values<F extends string> = Partial<Record<F, string>>;

export function idleState<F extends string>(): FormState<F> {
  return { status: "idle" };
}

/** Validation failed: show messages next to the fields. */
export function fieldErrorState<F extends string>(
  fieldErrors: FieldErrors<F>,
  values?: Values<F>,
): FormState<F> {
  return { status: "error", fieldErrors, values };
}

/** Request failed as a whole: show a banner above the form. */
export function messageErrorState<F extends string>(
  formError: FormMessage,
  values?: Values<F>,
): FormState<F> {
  return { status: "error", formError, values };
}

export function successState<F extends string>(
  values?: Values<F>,
): FormState<F> {
  return { status: "success", values };
}

/** Reads a text field; File entries and missing fields become "". */
export function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Reads a checkbox: browsers send "on" (or its value) only when checked. */
export function readBoolean(formData: FormData, name: string): boolean {
  return formData.has(name);
}

/** Collects the named text fields from a form into a plain object. */
export function readFields<F extends string>(
  formData: FormData,
  names: readonly F[],
): Record<F, string> {
  const result = {} as Record<F, string>;
  for (const name of names) result[name] = readString(formData, name);
  return result;
}
