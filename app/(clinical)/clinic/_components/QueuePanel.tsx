"use client";

import { useState } from "react";
import { formatDay, formatSlotTime } from "@/app/(app)/_lib/format";
import { Avatar } from "@/app/shared/ui/Avatar";
import { Badge } from "@/app/shared/ui/Badge";
import { Button } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { Heading, Text } from "@/app/shared/ui/Typography";
import { type PracticeOverview, QUEUE_LABELS } from "../_lib/model";
import styles from "../clinic.module.css";
import { ClinicalAction } from "./ClinicalAction";
import { PatientChart } from "./PatientChart";

const TONES = {
  in_exam: "primary",
  checked_in: "success",
  waiting: "accent",
  scheduled: "neutral",
  called: "primary",
} as const;

function waiting(status: PracticeOverview["queue"][number]["status"]) {
  return status === "checked_in" || status === "waiting";
}

export function QueuePanel({ overview }: { overview: PracticeOverview }) {
  const [waitingOnly, setWaitingOnly] = useState(false);
  const { date, entries, patients, queue, room } = overview;
  const patientsById = new Map(
    patients.map((patient) => [patient.id, patient]),
  );
  const waitingCount = queue.filter((visit) => waiting(visit.status)).length;
  const visits = (
    waitingOnly ? queue.filter((visit) => waiting(visit.status)) : queue
  ).toSorted((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <Card padding="lg" className={styles.panel}>
      <SectionHeader
        as="h2"
        level={3}
        title={`Today’s Patient Queue (${formatDay(date)})`}
        description={`Ordered by consultation time · ${room}`}
        actions={
          <div className={styles.inline}>
            <Button
              size="sm"
              variant={waitingOnly ? "ghost" : "secondary"}
              aria-pressed={!waitingOnly}
              onClick={() => setWaitingOnly(false)}
            >
              All ({queue.length} active)
            </Button>
            <Button
              size="sm"
              variant={waitingOnly ? "secondary" : "ghost"}
              aria-pressed={waitingOnly}
              onClick={() => setWaitingOnly(true)}
            >
              Waiting ({waitingCount})
            </Button>
          </div>
        }
      />
      {visits.length === 0 && (
        <Text tone="muted">No visits in this queue.</Text>
      )}
      <ol className={styles.queue}>
        {visits.map((visit) => {
          const patient = patientsById.get(visit.patientId);
          const inExam = visit.status === "in_exam";
          return (
            <li
              key={visit.id}
              className={styles.queueRow}
              data-active={inExam || undefined}
            >
              <Avatar
                name={patient?.name ?? "Patient"}
                shape="rounded"
                size="lg"
                decorative
              />
              <div className={styles.queueIdentity}>
                <div className={styles.inline}>
                  <Heading level={4} as="h3">
                    {patient?.name ?? "Patient"}
                    {patient?.breed &&
                      ` (${[patient.breed, patient.age].filter(Boolean).join(" · ")})`}
                  </Heading>
                  <Badge
                    variant={inExam ? "solid" : "soft"}
                    tone={TONES[visit.status]}
                    size="sm"
                  >
                    {QUEUE_LABELS[visit.status]}
                  </Badge>
                </div>
                <Text variant="supporting" tone="muted">
                  {[patient && `Owner: ${patient.owner}`, visit.reason]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </div>
              <div className={styles.queueActions}>
                <time dateTime={`${date}T${visit.startsAt}`}>
                  <Text
                    tone={inExam ? "primary" : "heading"}
                    variant="label"
                    as="span"
                  >
                    {formatSlotTime(visit.startsAt)}
                  </Text>
                </time>
                {waiting(visit.status) && patient ? (
                  <ClinicalAction
                    kind="call"
                    id={visit.id}
                    patient={patient.name}
                    label="Call In Next"
                    size="sm"
                  />
                ) : (
                  patient && (
                    <PatientChart
                      patient={patient}
                      entries={entries.filter(
                        ({ patientId }) => patientId === patient.id,
                      )}
                      label={inExam ? "Open Chart" : "View Chart"}
                      primary={inExam}
                    />
                  )
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
