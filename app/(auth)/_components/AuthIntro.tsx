import type { ReactNode } from "react";
import { Heading } from "@/app/shared/ui/Typography";
import styles from "./AuthIntro.module.css";

interface AuthIntroProps {
  title: ReactNode;
  description?: ReactNode;
}

/** Page title block for auth screens ("Welcome Back" + lead text). */
export function AuthIntro({ title, description }: AuthIntroProps) {
  return (
    <header className={styles.intro}>
      <Heading level={1}>{title}</Heading>
      {description ? <p className={styles.description}>{description}</p> : null}
    </header>
  );
}
