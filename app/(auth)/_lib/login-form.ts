/**
 * Login form contract shared by the client form and the Server Action:
 * field names, validation rules, state shape and the "remember me" duration.
 * Pure module: safe to import from both sides.
 */
import { type FormState, idleState } from "@/app/shared/forms/form-state";
import { createValidator, rules } from "@/app/shared/forms/validation";

export const LOGIN_FIELDS = ["email", "password", "remember"] as const;
export type LoginField = (typeof LOGIN_FIELDS)[number];

export type LoginState = FormState<LoginField>;
export const LOGIN_INITIAL_STATE: LoginState = idleState();

/** "Keep me logged in for N days": UI copy and cookie lifetime. */
export const REMEMBER_ME_DAYS = 30;

export const validateLogin = createValidator<LoginField>({
  email: [
    rules.required("Enter your clinic email address."),
    rules.email("Enter a valid email address."),
  ],
  password: [rules.required("Enter your password.")],
  remember: [],
});

/** Checkbox values arrive as "on" when checked, "" when not. */
export function isRemembered(value: string | undefined): boolean {
  return value === "on";
}

/** Canonical form of an email before it is sent anywhere. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
