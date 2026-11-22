"use server";

import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/config/routes";
import { deleteSession } from "@/app/shared/server/session";

/** Ends the session and returns to the sign-in screen. */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect(ROUTES.login);
}
