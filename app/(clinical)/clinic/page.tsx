import type { Metadata } from "next";
import { Suspense } from "react";
import { formatFullDay } from "@/app/(app)/_lib/format";
import { Alert } from "@/app/shared/ui/Alert";
import { Card } from "@/app/shared/ui/Card";
import { DescriptionList } from "@/app/shared/ui/DescriptionList";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { Skeleton } from "@/app/shared/ui/Skeleton";
import { ClinicalAction } from "./_components/ClinicalAction";
import {
  AlertsPanel,
  SummaryCards,
  VitalsPanel,
} from "./_components/OverviewPanels";
import { PatientChart } from "./_components/PatientChart";
import {
  Diagnostics,
  PracticeDirectory,
} from "./_components/PracticeDirectory";
import { PracticeShell, readPracticeView } from "./_components/PracticeShell";
import { QueuePanel } from "./_components/QueuePanel";
import { getPractice } from "./_lib/data";
import styles from "./clinic.module.css";

export const metadata: Metadata = {
  title: "Clinical Practice Dashboard · VertiVet",
};

async function Practice({
  searchParams,
}: Pick<PageProps<"/clinic">, "searchParams">) {
  const [{ clinician, overview, demo }, params] = await Promise.all([
    getPractice(),
    searchParams,
  ]);
  const view = readPracticeView(params.view);
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const inExam = overview.queue.filter(({ status }) => status === "in_exam");
  const activePatient = overview.patients.find(
    ({ id }) => id === inExam[0]?.patientId,
  );
  const titles = {
    overview: "Clinical Practice Dashboard",
    patients: "Patients & Pets",
    owners: "Pet Owners",
    queue: "Queue Schedule",
    diagnostics: "Rx & Diagnostics",
    settings: "Clinic Settings",
  };
  return (
    <PracticeShell
      clinician={clinician}
      overview={overview}
      view={view}
      query={query}
    >
      {demo && (
        <Alert variant="callout" tone="info">
          Demo workspace with sample records. Use fictional patient information.
        </Alert>
      )}
      <SectionHeader
        as="h1"
        title={titles[view]}
        description={
          view === "overview"
            ? `${formatFullDay(overview.date)} · ${overview.counts.booked} consultations booked · ${overview.room}`
            : undefined
        }
        actions={
          view === "overview" || view === "patients" ? (
            <div className={styles.inline}>
              <ClinicalAction kind="intake" label="+ New Patient Intake" />
              {view === "overview" && activePatient && (
                <PatientChart
                  patient={activePatient}
                  entries={overview.entries.filter(
                    ({ patientId }) => patientId === activePatient.id,
                  )}
                  label={`Resume ${activePatient.name}’s Consult →`}
                  primary
                />
              )}
            </div>
          ) : undefined
        }
      />
      {view === "overview" && (
        <>
          <SummaryCards counts={overview.counts} inExam={inExam.length} />
          <div className={styles.grid}>
            <QueuePanel overview={overview} />
            <div className={styles.panel}>
              <VitalsPanel patient={activePatient} room={overview.room} />
              <AlertsPanel alerts={overview.alerts} />
            </div>
          </div>
        </>
      )}
      {view === "queue" && <QueuePanel overview={overview} />}
      {(view === "patients" || view === "owners") && (
        <PracticeDirectory
          overview={overview}
          query={query}
          ownersOnly={view === "owners"}
        />
      )}
      {view === "diagnostics" && <Diagnostics overview={overview} />}
      {view === "settings" && (
        <Card padding="lg">
          <DescriptionList
            items={[
              { term: "Clinic", details: overview.clinicName },
              { term: "Exam room", details: overview.room },
            ]}
          />
        </Card>
      )}
    </PracticeShell>
  );
}

export default function ClinicalDashboard({
  searchParams,
}: PageProps<"/clinic">) {
  return (
    <Suspense
      fallback={
        <div className={styles.loading} aria-busy="true">
          <span className="sr-only">Loading clinical workspace…</span>
          <Skeleton shape="rect" height="10rem" />
        </div>
      }
    >
      <Practice searchParams={searchParams} />
    </Suspense>
  );
}
