"use client";

import { ROUTES } from "@/app/shared/config/routes";
import { Button, ButtonLink } from "@/app/shared/ui/Button";
import { StatusPanel } from "@/app/shared/ui/StatusPanel";
import styles from "./clinic.module.css";

export default function ClinicalError({ reset }: { reset: () => void }) {
  return (
    <main className={styles.loading}>
      <StatusPanel
        tone="danger"
        title="Couldn’t load the clinical workspace"
        actions={
          <>
            <Button onClick={reset}>Try Again</Button>
            <ButtonLink href={ROUTES.clinicalLogin} variant="secondary">
              Return to Clinical Sign In
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
