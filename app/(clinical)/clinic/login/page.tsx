import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/app/(auth)/_components/LoginForm";
import { ROUTES } from "@/app/shared/config/routes";
import { isDemoMode } from "@/app/shared/server/env";
import { Button } from "@/app/shared/ui/Button";
import {
  CalendarIcon,
  FileTextIcon,
  StethoscopeIcon,
} from "@/app/shared/ui/icons";
import { Logo } from "@/app/shared/ui/Logo";
import { TextLink } from "@/app/shared/ui/TextLink";
import { Heading, Text } from "@/app/shared/ui/Typography";
import { enterClinicalDemo, loginClinician } from "./actions";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Clinical Portal Sign In · VertiVet",
};

export default function ClinicalLogin() {
  return (
    <main className={styles.page}>
      <section className={styles.login}>
        <Link href={ROUTES.home} aria-label="VertiVet home">
          <Logo size="md" />
        </Link>
        <div className={styles.form}>
          <Heading level={1}>Clinical Portal</Heading>
          <Text tone="muted">
            Sign in to your veterinary practice workspace.
          </Text>
          <LoginForm action={loginClinician} clinical />
          {isDemoMode() && (
            <form action={enterClinicalDemo}>
              <Button type="submit" variant="secondary" fullWidth>
                Open Clinical Demo
              </Button>
            </form>
          )}
          <TextLink href={ROUTES.login}>Pet owner sign-in</TextLink>
          <TextLink href={ROUTES.requestAccount}>
            Request a clinic account
          </TextLink>
        </div>
      </section>
      <aside className={styles.practice} aria-label="Clinical workspace">
        <span className={styles.mark}>
          <StethoscopeIcon size={32} />
        </span>
        <Heading level={1} as="h2">
          Your practice workspace
        </Heading>
        <ul>
          <li>
            <CalendarIcon /> Review today’s patient queue
          </li>
          <li>
            <StethoscopeIcon /> Open patient charts and examination notes
          </li>
          <li>
            <FileTextIcon /> Review prescriptions and diagnostics
          </li>
        </ul>
      </aside>
    </main>
  );
}
