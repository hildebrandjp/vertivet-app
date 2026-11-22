/** Forgot-password form contract (pure: shared by client and server). */
import { type FormState, idleState } from "@/app/shared/forms/form-state";
import { createValidator, rules } from "@/app/shared/forms/validation";

export const FORGOT_PASSWORD_FIELDS = ["email"] as const;
export type ForgotPasswordField = (typeof FORGOT_PASSWORD_FIELDS)[number];

export type ForgotPasswordState = FormState<ForgotPasswordField>;
export const FORGOT_PASSWORD_INITIAL_STATE: ForgotPasswordState = idleState();

export const validateForgotPassword = createValidator<ForgotPasswordField>({
  email: [
    rules.required("Enter your clinic email address."),
    rules.email("Enter a valid email address."),
  ],
});
