import type { FormMessage } from "@/app/shared/forms/form-state";

export type AuthErrorCode =
  | "invalid_credentials"
  | "request_rejected"
  | "rate_limited"
  | "unavailable";

/** User-facing copy for every auth/onboarding failure. */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, FormMessage> = {
  invalid_credentials: {
    title: "Invalid login attempt",
    message:
      "The clinic email or password entered does not match our records. Please verify your details or use clinic password reset.",
  },
  request_rejected: {
    title: "Request not submitted",
    message:
      "We couldn't accept this request. An account may already exist for this clinic email. Try signing in or resetting your password.",
  },
  rate_limited: {
    title: "Too many attempts",
    message:
      "For your security, this is paused for a few minutes. Please try again shortly.",
  },
  unavailable: {
    title: "Service unavailable",
    message:
      "We couldn't reach VertiVet right now. Please try again in a moment.",
  },
};
