import type { Metadata } from "next";
import { ROUTES } from "@/app/shared/config/routes";
import { AuthAltAction } from "../_components/AuthAltAction";
import { AuthIntro } from "../_components/AuthIntro";
import { LoginForm } from "./_components/LoginForm";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Sign in · VertiVet",
  description: "Sign in to your VertiVet pet management dashboard.",
};

/**
 * Static page (prerendered at build). Only <LoginForm> hydrates;
 * everything else is server-rendered HTML.
 */
export default function LoginPage() {
  return (
    <div className={styles.panel}>
      <AuthIntro
        title="Welcome Back"
        description="Please enter your credentials to access your pet management dashboard."
      />
      <LoginForm />
      <AuthAltAction
        prompt={
          <>
            New to <strong>VertiVet</strong>?
          </>
        }
        href={ROUTES.requestAccount}
        label="Request a Clinic Account"
      />
    </div>
  );
}
