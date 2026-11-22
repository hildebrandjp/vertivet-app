import type { FormMessage } from "@/app/shared/forms/form-state";

export type AuthErrorCode =
  | "invalid_credentials"
  | "rate_limited"
  | "unavailable";

/** User-facing copy for every authentication failure. */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, FormMessage> = {
  invalid_credentials: {
    title: "Invalid login attempt",
    message:
      "The clinic email or password entered does not match our records. Please verify your details or use clinic password reset.",
  },
  rate_limited: {
    title: "Too many attempts",
    message:
      "For your security, sign-in is paused for a few minutes. Please try again shortly.",
  },
  unavailable: {
    title: "Sign-in unavailable",
    message:
      "We couldn't reach the VertiVet sign-in service. Please try again in a moment.",
  },
};
