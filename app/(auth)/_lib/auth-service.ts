import "server-only";
import type { AuthErrorCode } from "./auth-errors";

export interface Credentials {
  email: string;
  password: string;
}

export type AuthResult =
  | { ok: true; token: string }
  | { ok: false; code: AuthErrorCode };

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Verifies credentials against the VertiVet auth API.
 *
 * Contract (adapt to your backend):
 *   POST {AUTH_API_URL}/auth/login  { email, password }
 *   200 -> { token: string }
 *   400/401/403/422 -> invalid credentials, 429 -> rate limited
 */
export async function authenticate(
  credentials: Credentials,
): Promise<AuthResult> {
  const baseUrl = process.env.AUTH_API_URL;
  if (!baseUrl) {
    console.error("[auth] AUTH_API_URL is not configured.");
    return { ok: false, code: "unavailable" };
  }

  try {
    const response = await fetch(new URL("/auth/login", baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 429) return { ok: false, code: "rate_limited" };
    if ([400, 401, 403, 422].includes(response.status)) {
      return { ok: false, code: "invalid_credentials" };
    }
    if (!response.ok) return { ok: false, code: "unavailable" };

    const body: unknown = await response.json();
    const token =
      body && typeof body === "object" && "token" in body ? body.token : null;
    return typeof token === "string" && token
      ? { ok: true, token }
      : { ok: false, code: "unavailable" };
  } catch (error) {
    console.error("[auth] Login request failed.", error);
    return { ok: false, code: "unavailable" };
  }
}
