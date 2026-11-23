"use server";

import { redirect } from "next/navigation";
import type { LoginState } from "@/app/(auth)/_lib/login-form";
import { signIn } from "@/app/(auth)/_lib/sign-in";
import { ROUTES } from "@/app/shared/config/routes";
import { CLINICAL_DEMO_TOKEN } from "@/app/shared/server/clinical-session";
import { isDemoMode } from "@/app/shared/server/env";
import { createSession } from "@/app/shared/server/session";

export async function loginClinician(
  _previous: LoginState,
  data: FormData,
): Promise<LoginState> {
  return signIn(data, "clinic");
}

export async function enterClinicalDemo() {
  if (!isDemoMode()) redirect(ROUTES.clinicalLogin);
  await createSession(CLINICAL_DEMO_TOKEN, { remember: false });
  redirect(ROUTES.clinicalDashboard);
}
