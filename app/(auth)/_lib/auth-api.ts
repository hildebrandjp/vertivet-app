import "server-only";

/**
 * The single HTTP client for the VertiVet auth/onboarding API.
 * Owns the base URL, timeout, caching policy and status -> failure mapping
 * so every auth flow behaves the same way.
 */

export type ApiFailure = "rejected" | "rate_limited" | "unavailable";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; failure: ApiFailure; status?: number };

const REQUEST_TIMEOUT_MS = 10_000;

function toFailure(status: number): ApiFailure {
  if (status === 429) return "rate_limited";
  if (status >= 400 && status < 500) return "rejected";
  return "unavailable";
}

export async function postToAuthApi<T = unknown>(
  path: string,
  body: unknown,
): Promise<ApiResult<T | null>> {
  const baseUrl = process.env.AUTH_API_URL;
  if (!baseUrl) {
    console.error("[auth] AUTH_API_URL is not configured.");
    return { ok: false, failure: "unavailable" };
  }

  try {
    const response = await fetch(new URL(path, baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        ok: false,
        failure: toFailure(response.status),
        status: response.status,
      };
    }

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson ? ((await response.json()) as T) : null;
    return { ok: true, data };
  } catch (error) {
    console.error(`[auth] POST ${path} failed.`, error);
    return { ok: false, failure: "unavailable" };
  }
}
