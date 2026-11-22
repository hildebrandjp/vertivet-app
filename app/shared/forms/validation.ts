/**
 * Framework-free validation shared by Client Components (instant feedback)
 * and Server Actions (the authority). Never import browser or server APIs here.
 */

export type FieldErrors<F extends string> = Partial<Record<F, string>>;

export type ValidationResult<T, F extends string> =
  | { success: true; data: T }
  | { success: false; fieldErrors: FieldErrors<F> };

/** A rule returns an error message, or null when the value is valid. */
export type Rule = (value: string) => string | null;

// Pragmatic email check: one "@", a dot in the domain, no whitespace.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/** Reusable rule factories. Compose them per field. */
export const rules = {
  required:
    (message = "This field is required."): Rule =>
    (value) =>
      isBlank(value) ? message : null,
  email:
    (message = "Enter a valid email address."): Rule =>
    (value) =>
      isBlank(value) || isEmail(value) ? null : message,
  minLength:
    (length: number, message?: string): Rule =>
    (value) =>
      isBlank(value) || value.length >= length
        ? null
        : (message ?? `Use at least ${length} characters.`),
  maxLength:
    (length: number, message?: string): Rule =>
    (value) =>
      value.length <= length
        ? null
        : (message ?? `Use at most ${length} characters.`),
};

export type Schema<F extends string> = Record<F, Rule[]>;

/**
 * Builds a validator from a schema. The first failing rule per field wins.
 *
 * @example
 * const validate = createValidator({ email: [rules.required(), rules.email()] });
 * validate({ email: "x" }) // { success: false, fieldErrors: { email: "…" } }
 */
export function createValidator<F extends string>(schema: Schema<F>) {
  const fields = Object.keys(schema) as F[];

  return (
    input: Partial<Record<F, string>>,
  ): ValidationResult<Record<F, string>, F> => {
    const data = {} as Record<F, string>;
    const fieldErrors: FieldErrors<F> = {};

    for (const field of fields) {
      const value = input[field] ?? "";
      data[field] = value;
      for (const rule of schema[field]) {
        const error = rule(value);
        if (error) {
          fieldErrors[field] = error;
          break;
        }
      }
    }

    return Object.keys(fieldErrors).length > 0
      ? { success: false, fieldErrors }
      : { success: true, data };
  };
}
