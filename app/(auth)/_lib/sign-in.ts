import "server-only";
import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import {
  fieldErrorState,
  messageErrorState,
  readFields,
} from "@/app/shared/forms/form-state";
import { normalizeEmail } from "@/app/shared/forms/normalize";
import { lookupClinician } from "@/app/shared/server/clinical-session";
import { createSession } from "@/app/shared/server/session";
import { AUTH_ERROR_MESSAGES } from "./auth-errors";
import { authenticate } from "./auth-service";
import {
  isRemembered,
  LOGIN_FIELDS,
  type LoginState,
  validateLogin,
} from "./login-form";

export async function signIn(
  data: FormData,
  audience: "owner" | "clinic",
): Promise<LoginState> {
  const input = readFields(data, LOGIN_FIELDS);
  const values = { email: input.email.trim(), remember: input.remember };
  const result = validateLogin(input);
  if (!result.success) return fieldErrorState(result.fieldErrors, values);

  const auth = await authenticate({
    email: normalizeEmail(result.data.email),
    password: result.data.password,
  });
  if (!auth.ok)
    return messageErrorState(AUTH_ERROR_MESSAGES[auth.code], values);

  if (audience === "clinic") {
    try {
      if (!(await lookupClinician(auth.token))) {
        return messageErrorState(
          {
            title: "Clinical access required",
            message:
              "Use an account with clinical portal access or contact your clinic administrator.",
          },
          values,
        );
      }
    } catch {
      return messageErrorState(AUTH_ERROR_MESSAGES.unavailable, values);
    }
  }

  await createSession(auth.token, {
    remember: isRemembered(result.data.remember),
  });
  redirect(audience === "clinic" ? ROUTES.clinicalDashboard : ROUTES.dashboard);
}
