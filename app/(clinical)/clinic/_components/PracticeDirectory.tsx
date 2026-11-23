import { Avatar } from "@/app/shared/ui/Avatar";
import { Card } from "@/app/shared/ui/Card";
import { Heading, Text } from "@/app/shared/ui/Typography";
import { ENTRY_LABELS, type PracticeOverview } from "../_lib/model";
import styles from "../clinic.module.css";
import { PatientChart } from "./PatientChart";

export function PracticeDirectory({
  overview,
  query,
  ownersOnly,
}: {
  overview: PracticeOverview;
  query: string;
  ownersOnly: boolean;
}) {
  const needle = query.toLowerCase();
  const patients = overview.patients.filter((patient) =>
    [patient.name, patient.chip, patient.owner].some((value) =>
      value?.toLowerCase().includes(needle),
    ),
  );
  const owners = Map.groupBy(patients, ({ owner }) => owner);
  return (
    <Card padding="lg" className={styles.panel}>
      <Heading level={3} as="h2">
        {ownersOnly
          ? "Owners in the Practice Overview"
          : "Patients in the Practice Overview"}
      </Heading>
      {patients.length === 0 ? (
        <Text tone="muted">No matching records.</Text>
      ) : (
        <ul className={styles.queue}>
          {ownersOnly
            ? [...owners].map(([owner, pets]) => (
                <li className={styles.queueRow} key={owner}>
                  <Avatar name={owner} decorative />
                  <div>
                    <Heading level={4} as="h3">
                      {owner}
                    </Heading>
                    <Text tone="muted">
                      {pets.map(({ name }) => name).join(", ")}
                    </Text>
                  </div>
                </li>
              ))
            : patients.map((patient) => (
                <li className={styles.queueRow} key={patient.id}>
                  <Avatar name={patient.name} shape="rounded" decorative />
                  <div className={styles.queueIdentity}>
                    <Heading level={4} as="h3">
                      {patient.name}
                    </Heading>
                    <Text tone="muted">
                      {[patient.breed, patient.owner, patient.chip]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </div>
                  <PatientChart
                    patient={patient}
                    entries={overview.entries.filter(
                      ({ patientId }) => patientId === patient.id,
                    )}
                  />
                </li>
              ))}
        </ul>
      )}
    </Card>
  );
}

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
