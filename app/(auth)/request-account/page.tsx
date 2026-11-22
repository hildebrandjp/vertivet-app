import type { Metadata } from "next";
import { ROUTES } from "@/app/shared/config/routes";
import { AuthScreen } from "../_components/AuthScreen";
import { RequestAccountForm } from "./_components/RequestAccountForm";

export const metadata: Metadata = {
  title: "Request a clinic account · VertiVet",
  description:
    "Apply for a VertiVet account for your veterinary clinic or hospital.",
};

/** Static page (prerendered at build). Only <RequestAccountForm> hydrates. */
export default function RequestAccountPage() {
  return (
    <AuthScreen
      title="Request a Clinic Account"
      description="Tell us about your practice. Our onboarding team verifies every clinic before access is activated."
      altAction={{
        prompt: "Already have an account?",
        href: ROUTES.login,
        label: "Sign In",
      }}
    >
      <RequestAccountForm />
    </AuthScreen>
  );
}
