"use client";

import { Button } from "@/app/shared/ui/Button";
import styles from "../pets.module.css";

export function PrintRecordsButton() {
  return (
    <Button
      variant="secondary"
      className={styles.noPrint}
      onClick={() => window.print()}
    >
      Print / Save PDF
    </Button>
  );
}
