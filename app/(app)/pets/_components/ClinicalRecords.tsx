import { ROUTES, routeTo } from "@/app/shared/config/routes";
import { Badge } from "@/app/shared/ui/Badge";
import { Card } from "@/app/shared/ui/Card";
import { FileTextIcon } from "@/app/shared/ui/icons";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { TextLink } from "@/app/shared/ui/TextLink";
import { Text } from "@/app/shared/ui/Typography";
import type { Pet } from "../../_lib/data/types";
import { formatDay } from "../../_lib/format";
import styles from "../pets.module.css";
import { PrintRecordsButton } from "./PrintRecordsButton";

export function ClinicalRecords({
  pets,
  recordId,
  full = false,
}: {
  pets: Pet[];
  recordId?: string;
  full?: boolean;
}) {
  const records = pets
    .flatMap((pet) =>
      (pet.clinicalRecords ?? []).map((record) => ({ pet, record })),
    )
    .filter(({ record }) => !recordId || record.id === recordId)
    .sort((a, b) => b.record.date.localeCompare(a.record.date));
  const shown = full ? records : records.slice(0, 4);

  return (
    <section aria-labelledby="clinical-records">
      <Card padding="lg" className={styles.records}>
        <SectionHeader
          id="clinical-records"
          level={3}
          as="h2"
          title={
            full
              ? "Clinical Records"
              : "Recent Clinical Records & Diagnostic History"
          }
          description={
            full
              ? undefined
              : "Lab results, diagnostic reports, and notes from previous consultations."
          }
          actions={
            records.length > 0 &&
            (full ? (
              <PrintRecordsButton />
            ) : (
              <TextLink href={ROUTES.medicalRecords}>View All Records</TextLink>
            ))
          }
        />
        {!shown.length && (
          <Text tone="muted" variant="supporting">
            {recordId
              ? "This report is unavailable."
              : "No clinical records available."}
          </Text>
        )}
        {shown.length > 0 && (
          <ul className={styles.recordList}>
            {shown.map(({ pet, record }) => (
              <li
                key={JSON.stringify([pet.id, record.id])}
                className={styles.record}
              >
                <span className={styles.icon}>
                  <FileTextIcon />
                </span>
                <div className={styles.recordText}>
                  <Text variant="label" tone="heading" as="h3">
                    {record.title} — {pet.name}
                  </Text>
                  <Text variant="small" tone="muted">
                    <time dateTime={record.date}>{formatDay(record.date)}</time>{" "}
                    · {record.clinician}
                  </Text>
                  {full && (
                    <Text variant="supporting" className={styles.recordSummary}>
                      {record.summary}
                    </Text>
                  )}
                </div>
                <div className={styles.recordActions}>
                  <Badge
                    variant="soft"
                    tone={record.status === "normal" ? "success" : "accent"}
                    size="sm"
                  >
                    {record.status === "normal"
                      ? "Passed / Normal"
                      : "Follow-up Advised"}
                  </Badge>
                  {!full && (
                    <TextLink
                      href={routeTo.petRecords(pet.id, record.id)}
                      aria-label={`View report: ${record.title} for ${pet.name}`}
                    >
                      View Report →
                    </TextLink>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
