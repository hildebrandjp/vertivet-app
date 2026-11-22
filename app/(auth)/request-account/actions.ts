"use server";

import {
  fieldErrorState,
  messageErrorState,
  readFields,
  successState,
} from "@/app/shared/forms/form-state";
import { normalizeEmail, normalizeText } from "@/app/shared/forms/normalize";
import { AUTH_ERROR_MESSAGES } from "../_lib/auth-errors";
import { submitAccountRequest } from "../_lib/auth-service";
import {
  REQUEST_ACCOUNT_FIELDS,
  type RequestAccountState,
  validateRequestAccount,
} from "../_lib/request-account-form";

/** Submits a clinic onboarding request for manual verification. */
export async function requestAccount(
  _previous: RequestAccountState,
  formData: FormData,
): Promise<RequestAccountState> {
  const input = readFields(formData, REQUEST_ACCOUNT_FIELDS);
  // Nothing here is secret, so every field is echoed back to re-fill the form.
  const values = input;

  const result = validateRequestAccount(input);
  if (!result.success) return fieldErrorState(result.fieldErrors, values);

  const { data } = result;
  const outcome = await submitAccountRequest({
    clinicName: normalizeText(data.clinicName),
    clinicType: data.clinicType,
    contactName: normalizeText(data.contactName),
    email: normalizeEmail(data.email),
    phone: data.phone.trim(),
    teamSize: data.teamSize,
    message: data.message.trim(),
  });
  if (!outcome.ok) {
    return messageErrorState(AUTH_ERROR_MESSAGES[outcome.code], values);
  }

  return successState({
    clinicName: normalizeText(data.clinicName),
    contactName: normalizeText(data.contactName),
    email: normalizeEmail(data.email),
  });
}
