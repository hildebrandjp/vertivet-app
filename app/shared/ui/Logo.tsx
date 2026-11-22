import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Logo.module.css";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  /** Light-on-dark version, for the navy sidebar. */
  inverse?: boolean;
  /** Show "TRANSFORMING PET CARE" under the wordmark. */
  showTagline?: boolean;
  /**
   * Optional brand mark (e.g. <Image src="/logo-mark.svg" ... />) placed
   * before the wordmark. Pass the official asset here.
   */
  mark?: ReactNode;
  className?: string;
}

/** VertiVet wordmark: navy "Verti" + golden "Vet". */
export function Logo({
  size = "md",
  inverse = false,
  showTagline = true,
  mark,
  className,
}: LogoProps) {
  return (
    <span
      className={cx(styles.logo, className)}
      data-size={size}
      data-inverse={inverse || undefined}
    >
      {mark ? <span className={styles.mark}>{mark}</span> : null}
      <span className={styles.text}>
        <span className={styles.wordmark}>
          Verti<span className={styles.accent}>Vet</span>
        </span>
        {showTagline ? (
          <span className={styles.tagline}>Transforming pet care</span>
        ) : null}
      </span>
    </span>
  );
}
