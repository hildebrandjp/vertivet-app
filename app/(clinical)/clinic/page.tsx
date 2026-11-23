import type { Metadata } from "next";
import { Suspense } from "react";
import { formatFullDay } from "@/app/(app)/_lib/format";
import { Alert } from "@/app/shared/ui/Alert";
import { Card } from "@/app/shared/ui/Card";
import { DescriptionList } from "@/app/shared/ui/DescriptionList";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { Skeleton } from "@/app/shared/ui/Skeleton";
import { ClientDirectory } from "./_components/ClientDirectory";
import { ClinicalAction } from "./_components/ClinicalAction";
import { Diagnostics } from "./_components/Diagnostics";
import {
  AlertsPanel,
  SummaryCards,
  VitalsPanel,
} from "./_components/OverviewPanels";
import { PatientChart } from "./_components/PatientChart";
import { PatientRegistry } from "./_components/PatientRegistry";
import { PracticeShell, readPracticeView } from "./_components/PracticeShell";
import { QueuePanel } from "./_components/QueuePanel";
import { QueueSchedule } from "./_components/QueueSchedule";
import { getPractice } from "./_lib/data";
import { readOrderQuery } from "./_lib/diagnostics";
import { getOrders } from "./_lib/diagnostics-data";
import { readRegistryQuery } from "./_lib/registry";
import { getRegistry } from "./_lib/registry-data";
import { readScheduleQuery } from "./_lib/schedule";
import { getSchedule } from "./_lib/schedule-data";
import styles from "./clinic.module.css";

export const metadata: Metadata = {
  title: "Clinical Practice Dashboard · VertiVet",
};

async function Practice({
  searchParams,
}: Pick<PageProps<"/clinic">, "searchParams">) {
  const params = await searchParams;
  const view = readPracticeView(params.view);
  const inRegistry = view === "patients" || view === "owners";
  const filters = readRegistryQuery(params);
  const orderFilters = readOrderQuery(params);
  const [{ clinician, overview, demo }, registry, orders] = await Promise.all([
    getPractice(),
    inRegistry ? getRegistry(filters) : null,
    view === "diagnostics" ? getOrders(orderFilters) : null,
  ]);
  const scheduleQuery = readScheduleQuery(params, overview.date);
  const schedule = view === "queue" ? await getSchedule(scheduleQuery) : null;
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
      query={filters.query}
    >
      {demo && (
        <Alert variant="callout" tone="info">
          Demo workspace with sample records. Use fictional patient information.
        </Alert>
      )}
      {!inRegistry && !schedule && !orders && (
        <SectionHeader
          as="h1"
          title={titles[view]}
          description={
            view === "overview"
              ? `${formatFullDay(overview.date)} · ${overview.counts.booked} consultations booked · ${overview.room}`
              : undefined
          }
          actions={
            view === "overview" ? (
              <div className={styles.inline}>
                <ClinicalAction kind="intake" label="+ New Patient Intake" />
                {activePatient && (
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
      )}
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
      {schedule && (
        <QueueSchedule
          schedule={schedule}
          query={scheduleQuery}
          today={overview.date}
          demo={demo}
        />
      )}
      {registry &&
        (view === "owners" ? (
          <ClientDirectory
            filters={filters}
            registry={registry}
            practiceCounts={overview.counts}
          />
        ) : (
          <PatientRegistry filters={filters} registry={registry} />
        ))}
      {orders && (
        <Diagnostics
          data={orders}
          filters={orderFilters}
          canManage={clinician.role === "veterinarian"}
        />
      )}
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
