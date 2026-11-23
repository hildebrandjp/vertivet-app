import { Card } from "@/app/shared/ui/Card";
import { Heading, Text } from "@/app/shared/ui/Typography";
import { ENTRY_LABELS, type PracticeOverview } from "../_lib/model";
import styles from "../clinic.module.css";

export function Diagnostics({ overview }: { overview: PracticeOverview }) {
  const drafts = overview.entries.filter(({ kind }) => kind !== "note");
  const patients = new Map(overview.patients.map(({ id, name }) => [id, name]));
  return (
    <Card padding="lg" className={styles.panel}>
      <Heading level={3} as="h2">
        Prescriptions &amp; Lab Drafts
      </Heading>
      <Text tone="muted">{overview.counts.reports} pending reports</Text>
      {drafts.length ? (
        <ul className={styles.plainList}>
          {drafts.map((entry) => (
            <li key={entry.id}>
              <Text variant="label">
                {ENTRY_LABELS[entry.kind]} ·{" "}
                {patients.get(entry.patientId) ?? "Patient"}
              </Text>
              <Text className={styles.entry}>{entry.text}</Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text tone="muted">No prescription or lab drafts.</Text>
      )}
    </Card>
  );
}
