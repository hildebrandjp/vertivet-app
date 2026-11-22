import "server-only";
import { cookies } from "next/headers";
import { REMEMBER_ME_DAYS, SESSION_COOKIE } from "../config/session";

const SECONDS_PER_DAY = 60 * 60 * 24;

/** Reads the session token. Calling this makes the render dynamic. */
export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Stores the session token in an httpOnly cookie. Without "remember me"
 * it is a browser-session cookie; with it, it lasts REMEMBER_ME_DAYS.
 * Only callable from Server Actions and Route Handlers.
 */
export async function createSession(
  token: string,
  { remember }: { remember: boolean },
): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? REMEMBER_ME_DAYS * SECONDS_PER_DAY : undefined,
  });
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
