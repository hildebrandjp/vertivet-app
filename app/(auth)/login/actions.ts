"use server";

import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import {
  fieldErrorState,
  messageErrorState,
  readFields,
} from "@/app/shared/forms/form-state";
import { normalizeEmail } from "@/app/shared/forms/normalize";
import { AUTH_ERROR_MESSAGES } from "../_lib/auth-errors";
import { authenticate } from "../_lib/auth-service";
import {
  isRemembered,
  LOGIN_FIELDS,
  type LoginState,
  validateLogin,
} from "../_lib/login-form";
import { createSession } from "../_lib/session";

/**
 * Login Server Action (used with useActionState). Re-validates with the same
 * rules as the client, because client checks can be bypassed.
 */
export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const input = readFields(formData, LOGIN_FIELDS);
  // Echo back non-secret values so the form can re-fill after React resets it.
  const values = { email: input.email.trim(), remember: input.remember };

  const result = validateLogin(input);
  if (!result.success) {
    return fieldErrorState(result.fieldErrors, values);
  }

  const auth = await authenticate({
    email: normalizeEmail(result.data.email),
    password: result.data.password,
  });
  if (!auth.ok) {
    return messageErrorState(AUTH_ERROR_MESSAGES[auth.code], values);
  }

  await createSession(auth.token, {
    remember: isRemembered(result.data.remember),
  });
  redirect(ROUTES.dashboard);
}
