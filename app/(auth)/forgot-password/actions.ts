"use server";

import {
  fieldErrorState,
  messageErrorState,
  readFields,
  successState,
} from "@/app/shared/forms/form-state";
import { normalizeEmail } from "@/app/shared/forms/normalize";
import { AUTH_ERROR_MESSAGES } from "../_lib/auth-errors";
import { requestPasswordReset } from "../_lib/auth-service";
import {
  FORGOT_PASSWORD_FIELDS,
  type ForgotPasswordState,
  validateForgotPassword,
} from "../_lib/forgot-password-form";

/**
 * Sends a password-reset link. The response is identical whether or not
 * the email has an account, so it cannot be used to probe for users.
 */
export async function forgotPassword(
  _previous: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const input = readFields(formData, FORGOT_PASSWORD_FIELDS);
  const values = { email: input.email.trim() };

  const result = validateForgotPassword(input);
  if (!result.success) return fieldErrorState(result.fieldErrors, values);

  const outcome = await requestPasswordReset(normalizeEmail(result.data.email));
  if (!outcome.ok) {
    return messageErrorState(AUTH_ERROR_MESSAGES[outcome.code], values);
  }
  return successState(values);
}
