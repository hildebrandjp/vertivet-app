/** Locale and time zone for formatting dates in the signed-in app. */
export const APP_LOCALE = "en-US";

/**
 * Clinic time zone used to display appointment times. Formatting happens
 * on the server, so this must be explicit rather than the server's zone.
 */
export const APP_CURRENCY = "USD";

export const APP_TIME_ZONE = process.env.APP_TIME_ZONE ?? "UTC";
