import type { ReactNode } from "react";
import { AuthAltAction } from "./AuthAltAction";
import { AuthIntro } from "./AuthIntro";
import styles from "./AuthScreen.module.css";

interface AuthScreenProps {
  title: ReactNode;
  description?: ReactNode;
  /** The form island (a Client Component). */
  children: ReactNode;
  /** Secondary path shown under the form. */
  altAction?: { prompt: ReactNode; href: string; label: ReactNode };
}

/**
 * Right-hand column of every auth page: intro, form, secondary path.
 * Server Component, so pages stay static and only the form hydrates.
 */
export function AuthScreen({
  title,
  description,
  children,
  altAction,
}: AuthScreenProps) {
  return (
    <div className={styles.screen}>
      <AuthIntro title={title} description={description} />
      {children}
      {altAction ? (
        <div className={styles.alt}>
          <AuthAltAction {...altAction} />
        </div>
      ) : null}
    </div>
  );
}
