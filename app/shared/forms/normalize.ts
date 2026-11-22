/** Canonical forms of user input, applied before data leaves the server. */

/** Emails are compared case-insensitively and must not carry whitespace. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Trims and collapses internal runs of whitespace ("  Paws   Clinic " -> "Paws Clinic"). */
export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
