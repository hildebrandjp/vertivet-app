import "server-only";
import { getApiBaseUrl } from "./env";

/**
 * The single HTTP client for the VertiVet backend. Owns the base URL,
 * auth header, timeout, caching policy and status -> failure mapping.
 */

export type ApiFailure =
  | "unauthorized"
  | "rejected"
  | "rate_limited"
  | "unavailable";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; failure: ApiFailure; status?: number };

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Session token, sent as a Bearer header. */
  token?: string;
}

const REQUEST_TIMEOUT_MS = 10_000;

function toFailure(status: number): ApiFailure {
  if (status === 401) return "unauthorized";
  if (status === 429) return "rate_limited";
  if (status >= 400 && status < 500) return "rejected";
  return "unavailable";
}

export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", body, token }: ApiRequestOptions = {},
): Promise<ApiResult<T | null>> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    console.error("[api] API_BASE_URL is not configured.");
    return { ok: false, failure: "unavailable" };
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const multipart = body instanceof FormData;
  if (body !== undefined && !multipart)
    headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(new URL(path, baseUrl), {
      method,
      headers,
      body: multipart || body === undefined ? body : JSON.stringify(body),
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
    console.error(`[api] ${method} ${path} failed.`, error);
    return { ok: false, failure: "unavailable" };
  }
}
