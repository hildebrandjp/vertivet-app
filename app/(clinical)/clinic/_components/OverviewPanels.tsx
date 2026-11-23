import type { ReactNode } from "react";
import { Alert } from "@/app/shared/ui/Alert";
import { Badge } from "@/app/shared/ui/Badge";
import { Card } from "@/app/shared/ui/Card";
import {
  CalendarIcon,
  FileTextIcon,
  HeartIcon,
  StethoscopeIcon,
} from "@/app/shared/ui/icons";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { Heading, Text } from "@/app/shared/ui/Typography";
import type { ClinicalPatient, PracticeOverview } from "../_lib/model";
import styles from "../clinic.module.css";
import { ClinicalAction } from "./ClinicalAction";

export function SummaryCards({
  counts,
  inExam,
}: {
  counts: PracticeOverview["counts"];
  inExam: number;
}) {
  const cards = [
    {
      label: "Today’s Patients",
      value: `${counts.booked} Booked`,
      detail: `${inExam} In Exam`,
      Icon: CalendarIcon,
    },
    {
      label: "Active Pet Patients",
      value: `${counts.patients} Pets`,
      Icon: HeartIcon,
    },
    {
      label: "Registered Clients",
      value: `${counts.owners} Owners`,
      Icon: StethoscopeIcon,
    },
    {
      label: "Pending Lab Rx",
      value: `${counts.reports} Reports`,
      Icon: FileTextIcon,
    },
  ];

  return (
    <PracticeStats
      cards={cards.map(({ Icon, ...card }) => ({ ...card, icon: <Icon /> }))}
    />
  );
}

export function PracticeStats({
  cards,
}: {
  cards: { label: string; value: string; detail?: string; icon: ReactNode }[];
}) {
  return (
    <div className={styles.summary}>
      {cards.map(({ label, value, detail, icon }) => (
        <Card key={label} className={styles.stat}>
          <span className={styles.statIcon}>{icon}</span>
          <div>
            <Text variant="supporting" tone="muted">
              {label}
            </Text>
            <div className={styles.inline}>
              <Heading level={2} as="p">
                {value}
              </Heading>
              {detail && (
                <Text variant="small" tone="muted">
                  {detail}
                </Text>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function VitalsPanel({
  patient,
  room,
}: {
  patient?: ClinicalPatient;
  room: string;
}) {
  const vitals = patient?.vitals;
  return (
    <Card padding="lg" className={styles.panel}>
      <SectionHeader
        as="h2"
        level={3}
        title={
          patient
            ? `Active Patient Vitals (${patient.name})`
            : "Active Patient Vitals"
        }
        actions={
          <Badge variant="soft" shape="pill">
            {room}
          </Badge>
        }
      />
      {vitals ? (
        <dl className={styles.vitals}>
          <div>
            <dt>Weight</dt>
            <dd>{vitals.weightKg} kg</dd>
          </div>
          <div>
            <dt>Temperature</dt>
            <dd>{vitals.temperatureF} °F</dd>
          </div>
          <div>
            <dt>Heart Rate</dt>
            <dd>{vitals.heartRate} bpm</dd>
          </div>
        </dl>
      ) : (
        <Text tone="muted">
          {patient
            ? "Vitals haven’t been recorded for this patient."
            : "No patient is currently in exam."}
        </Text>
      )}
      {patient && (
        <>
          <ClinicalAction
            kind="note"
            id={patient.id}
            patient={patient.name}
            label="+ Log Examination Notes"
            variant="primary"
            fullWidth
          />
          <div className={styles.inline}>
            <ClinicalAction
              kind="prescription"
              id={patient.id}
              patient={patient.name}
              label="Write Rx"
            />
            <ClinicalAction
              kind="lab"
              id={patient.id}
              patient={patient.name}
              label="Order Lab"
            />
          </div>
        </>
      )}
    </Card>
  );
}

export function AlertsPanel({
  alerts,
}: {
  alerts: PracticeOverview["alerts"];
}) {
  return (
    <Card padding="lg" className={styles.panel} id="clinical-alerts">
      <Heading level={3} as="h2">
        Clinical Tasks &amp; Alerts
      </Heading>
      {alerts.length ? (
        alerts.map((alert) => (
          <Alert
            key={alert.id}
            tone={alert.tone}
            variant="callout"
            title={alert.title}
          >
            {alert.description}
          </Alert>
        ))
      ) : (
        <Text tone="muted">No active clinical alerts.</Text>
      )}
    </Card>
  );
}
