import "server-only";
import { postToAuthApi } from "./auth-api";
import type { AuthErrorCode } from "./auth-errors";

/*
 * API contract (adapt the paths to your backend):
 *   POST /auth/login               { email, password }  -> 200 { token }
 *   POST /auth/password-reset      { email }            -> 2xx
 *   POST /clinic-account-requests  AccountRequest       -> 2xx
 * 4xx = rejected, 429 = rate limited, anything else = unavailable.
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
export type ServiceResult = { ok: true } | ServiceFailure;
export type AuthenticateResult = { ok: true; token: string } | ServiceFailure;

export async function authenticate(
  credentials: Credentials,
): Promise<AuthenticateResult> {
  const result = await postToAuthApi<{ token?: unknown }>(
    "/auth/login",
    credentials,
  );
  if (!result.ok) {
    return {
      ok: false,
      code:
        result.failure === "rejected" ? "invalid_credentials" : result.failure,
    };
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
  const result = await postToAuthApi("/auth/password-reset", { email });
  if (result.ok || result.failure === "rejected") return { ok: true };
  return { ok: false, code: result.failure };
}

export async function submitAccountRequest(
  request: AccountRequest,
): Promise<ServiceResult> {
  const result = await postToAuthApi("/clinic-account-requests", request);
  if (result.ok) return { ok: true };
  return {
    ok: false,
    code: result.failure === "rejected" ? "request_rejected" : result.failure,
  };
}
