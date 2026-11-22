import type { Metadata } from "next";
import { ROUTES } from "@/app/shared/config/routes";
import { AuthScreen } from "../_components/AuthScreen";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password · VertiVet",
  description: "Request a secure link to reset your VertiVet password.",
};

/** Static page (prerendered at build). Only <ForgotPasswordForm> hydrates. */
export default function ForgotPasswordPage() {
  return (
    <AuthScreen
      title="Forgot Password?"
      description="Enter your clinic email and we'll send you a link to get back into your dashboard."
      altAction={{
        prompt: "Remembered your password?",
        href: ROUTES.login,
        label: "Back to Sign In",
      }}
    >
      <ForgotPasswordForm />
    </AuthScreen>
  );
}
