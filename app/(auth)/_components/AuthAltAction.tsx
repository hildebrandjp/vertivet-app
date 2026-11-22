import type { ReactNode } from "react";
import { ButtonLink } from "@/app/shared/ui/Button";
import styles from "./AuthAltAction.module.css";

interface AuthAltActionProps {
  /** e.g. <>New to <strong>VertiVet</strong>?</> */
  prompt: ReactNode;
  href: string;
  label: ReactNode;
}

/** Secondary path under an auth form ("New to VertiVet? Request an account"). */
export function AuthAltAction({ prompt, href, label }: AuthAltActionProps) {
  return (
    <div className={styles.altAction}>
      <p className={styles.prompt}>{prompt}</p>
      <ButtonLink
        href={href}
        variant="secondary"
        size="lg"
        fullWidth
        prefetch={false}
      >
        {label}
      </ButtonLink>
    </div>
  );
}
