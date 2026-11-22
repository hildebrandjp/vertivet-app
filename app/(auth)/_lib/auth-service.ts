import "server-only";
import { type ApiFailure, apiRequest } from "@/app/shared/server/api-client";
import type { AuthErrorCode } from "./auth-errors";

/*
 * API contract (adapt the paths to your backend):
 *   POST /auth/login               { email, password }  -> 200 { token }
 *   POST /auth/password-reset      { email }            -> 2xx
 *   POST /clinic-account-requests  AccountRequest       -> 2xx
 * 401/4xx = rejected, 429 = rate limited, anything else = unavailable.
 */

export interface Credentials {
  email: string;
  password: string;
}

export interface AccountRequest {
  clinicName: string;
  clinicType: string;
  contactName: string;
  email: string;
  phone: string;
  teamSize: string;
  message: string;
}

export type ServiceFailure = { ok: false; code: AuthErrorCode };

/** Maps transport failures; `rejectedAs` names what a 4xx means here. */
function toCode(failure: ApiFailure, rejectedAs: AuthErrorCode): AuthErrorCode {
  if (failure === "rejected" || failure === "unauthorized") return rejectedAs;
  return failure;
}
export type ServiceResult = { ok: true } | ServiceFailure;
export type AuthenticateResult = { ok: true; token: string } | ServiceFailure;

export async function authenticate(
  credentials: Credentials,
): Promise<AuthenticateResult> {
  const result = await apiRequest<{ token?: unknown }>("/auth/login", {
    method: "POST",
    body: credentials,
  });
  if (!result.ok) {
    return { ok: false, code: toCode(result.failure, "invalid_credentials") };
  }
  const token = result.data?.token;
  return typeof token === "string" && token
    ? { ok: true, token }
    : { ok: false, code: "unavailable" };
}

/**
 * Asks the API to email a reset link. An unknown email ("rejected") is
 * reported as success so the screen never reveals which accounts exist.
 */
export async function requestPasswordReset(
  email: string,
): Promise<ServiceResult> {
  const result = await apiRequest("/auth/password-reset", {
    method: "POST",
    body: { email },
  });
  // Unknown email ("rejected") still reports success: no account probing.
  if (result.ok || result.failure === "rejected") return { ok: true };
  return { ok: false, code: toCode(result.failure, "unavailable") };
}

export async function submitAccountRequest(
  request: AccountRequest,
): Promise<ServiceResult> {
  const result = await apiRequest("/clinic-account-requests", {
    method: "POST",
    body: request,
  });
  if (result.ok) return { ok: true };
  return { ok: false, code: toCode(result.failure, "request_rejected") };
}
