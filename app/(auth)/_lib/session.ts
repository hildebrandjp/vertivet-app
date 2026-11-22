import "server-only";
import { cookies } from "next/headers";
import { REMEMBER_ME_DAYS } from "./login-form";

export const SESSION_COOKIE = "vv_session";
const SECONDS_PER_DAY = 60 * 60 * 24;

/**
 * Stores the session token in an httpOnly cookie. Without "remember me"
 * it is a browser-session cookie; with it, it lasts REMEMBER_ME_DAYS.
 */
export async function createSession(
  token: string,
  { remember }: { remember: boolean },
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
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
