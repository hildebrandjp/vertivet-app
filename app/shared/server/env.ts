import "server-only";

/** Base URL of the VertiVet backend API (auth, onboarding and app data). */
export function getApiBaseUrl(): string | undefined {
  return process.env.API_BASE_URL;
}

/**
 * Demo mode: local development with no API configured. The app then serves
 * fixture data and skips the login wall so screens can be built offline.
 * It can never be on in production builds.
 */
export function isDemoMode(): boolean {
  return process.env.NODE_ENV !== "production" && !process.env.API_BASE_URL;
}
