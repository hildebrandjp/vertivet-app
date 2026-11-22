import type { Metadata } from "next";
import { ROUTES } from "@/app/shared/config/routes";
import { AuthScreen } from "../_components/AuthScreen";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in · VertiVet",
  description: "Sign in to your VertiVet pet management dashboard.",
};

/** Static page (prerendered at build). Only <LoginForm> hydrates. */
export default function LoginPage() {
  return (
    <AuthScreen
      title="Welcome Back"
      description="Please enter your credentials to access your pet management dashboard."
      altAction={{
        prompt: (
          <>
            New to <strong>VertiVet</strong>?
          </>
        ),
        href: ROUTES.requestAccount,
        label: "Request a Clinic Account",
      }}
    >
      <LoginForm />
    </AuthScreen>
  );
}
