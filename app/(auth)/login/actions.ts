"use server";

import type { LoginState } from "../_lib/login-form";
import { signIn } from "../_lib/sign-in";

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return signIn(formData, "owner");
}
