import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/app/shared/config/routes";
import { Logo } from "@/app/shared/ui/Logo";
import { AuthHero } from "./_components/AuthHero";
import styles from "./auth-layout.module.css";

/**
 * Shared shell for every auth screen (login, request account, reset…):
 * brand + hero on the left, the page's form panel on the right.
 * Server Component: ships no JavaScript of its own.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.brand}>
        <Link
          href={ROUTES.home}
          aria-label="VertiVet home"
          className={styles.logoLink}
        >
          <Logo size="md" />
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
      <AuthHero className={styles.hero} />
    </div>
  );
}
