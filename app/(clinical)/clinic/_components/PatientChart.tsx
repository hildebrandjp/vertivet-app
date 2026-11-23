"use client";

import { useState } from "react";
import { Button } from "@/app/shared/ui/Button";
import { DescriptionList } from "@/app/shared/ui/DescriptionList";
import { Dialog } from "@/app/shared/ui/Dialog";
import { Heading, Text } from "@/app/shared/ui/Typography";
import {
  type ClinicalEntry,
  type ClinicalPatient,
  ENTRY_LABELS,
} from "../_lib/model";
import styles from "../clinic.module.css";

export function PatientChart({
  patient,
  entries,
  label = "View Chart",
  primary = false,
}: {
  patient: ClinicalPatient;
  entries: ClinicalEntry[];
  label?: string;
  primary?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        variant={primary ? "primary" : "secondary"}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open && (
        <Dialog
          open
          onOpenChange={setOpen}
          title={`${patient.name}’s Chart`}
          showCloseButton
          size="md"
        >
          <div className={styles.commandForm}>
            <DescriptionList
              items={[
                { term: "Owner", details: patient.owner },
                { term: "Breed", details: patient.breed || "Not recorded" },
                { term: "Microchip", details: patient.chip || "Not recorded" },
              ]}
            />
            <Heading level={4} as="h3">
              Clinical Entries
            </Heading>
            {entries.length ? (
              <ul className={styles.plainList}>
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <Text variant="label">{ENTRY_LABELS[entry.kind]}</Text>
                    <Text className={styles.entry}>{entry.text}</Text>
                  </li>
                ))}
              </ul>
            ) : (
              <Text tone="muted">No clinical entries recorded.</Text>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
}
