import { formatDay, formatSlotTime } from "@/app/(app)/_lib/format";
import { Badge } from "@/app/shared/ui/Badge";
import { ButtonLink } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { Heading, Text } from "@/app/shared/ui/Typography";
import type {
  ClinicSchedule,
  ScheduleDay,
  ScheduleQuery,
} from "../_lib/schedule";
import { canCallVisit, orderVisits, scheduleHref } from "../_lib/schedule";
import styles from "../schedule.module.css";
import { ClinicalAction } from "./ClinicalAction";
import { PatientChart } from "./PatientChart";
import { SessionTimer } from "./ScheduleLive";

const STATUS = {
  in_exam: { label: "In Session", tone: "primary" },
  checked_in: { label: "Arrived & Ready", tone: "success" },
  waiting: { label: "Waiting Room", tone: "accent" },
  scheduled: { label: "Upcoming", tone: "neutral" },
  called: { label: "Called In", tone: "primary" },
  completed: { label: "Completed", tone: "neutral" },
} as const;

export function ScheduleDayTimeline({
  schedule,
  day,
  isToday,
}: {
  schedule: ClinicSchedule;
  day: ScheduleDay;
  isToday: boolean;
}) {
  const patients = new Map(
    schedule.patients.map((patient) => [patient.id, patient]),
  );
  const rooms = new Map(schedule.rooms.map((room) => [room.id, room.name]));
  const entriesByPatient = Map.groupBy(
    schedule.entries,
    ({ patientId }) => patientId,
  );
  return day.visits.length ? (
    <ol className={styles.timeline}>
      {orderVisits(day.visits).map((visit) => {
        const patient = patients.get(visit.patientId);
        const active = isToday && visit.status === "in_exam";
        const status = STATUS[visit.status];
        const characteristics = [patient?.breed, patient?.age]
          .filter(Boolean)
          .join(" · ");
        const details = [
          patient && `Owner: ${patient.owner}`,
          visit.roomId && rooms.get(visit.roomId),
          visit.detail,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <li
            key={visit.id}
            className={styles.slot}
            data-active={active || undefined}
          >
            <div className={styles.time}>
              <time dateTime={`${day.date}T${visit.startsAt}`}>
                {formatSlotTime(visit.startsAt)}
              </time>
              {active ? (
                <Badge size="sm">Now</Badge>
              ) : (
                visit.durationMinutes !== undefined && (
                  <Text tone="muted" variant="small">
                    {visit.durationMinutes} min
                  </Text>
                )
              )}
            </div>
            <div className={styles.visit}>
              <Heading level={4} as="h3">
                {patient?.name ?? "Patient"}
                {characteristics && ` (${characteristics})`}
              </Heading>
              <Text variant="label" tone={active ? "primary" : "heading"}>
                {visit.reason}
              </Text>
              {details && (
                <Text variant="supporting" tone="muted">
                  {details}
                </Text>
              )}
            </div>
            <div className={styles.slotActions}>
              {active &&
              (visit.sessionStartedAt || visit.elapsedMinutes !== undefined) ? (
                <Badge variant="outline" size="sm">
                  <SessionTimer
                    startedAt={visit.sessionStartedAt}
                    elapsed={visit.elapsedMinutes}
                    duration={visit.durationMinutes}
                  />
                </Badge>
              ) : (
                <Badge variant="soft" tone={status.tone} size="sm">
                  {status.label}
                </Badge>
              )}
              {active && patient && (
                <PatientChart
                  patient={patient}
                  entries={entriesByPatient.get(patient.id) ?? []}
                  label="Open Active Chart →"
                  primary
                />
              )}
              {isToday && canCallVisit(visit.status) && (
                <ClinicalAction
                  kind="call"
                  id={visit.id}
                  patient={patient?.name}
                  label="Call In"
                  size="sm"
                />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  ) : (
    <Text tone="muted">No consultations scheduled for this date.</Text>
  );
}

export function ScheduleWeek({
  schedule,
  query,
  dates,
  today,
}: {
  schedule: ClinicSchedule;
  query: ScheduleQuery;
  dates: string[];
  today: string;
}) {
  const patients = new Map(schedule.patients.map(({ id, name }) => [id, name]));
  const byDate = new Map(schedule.days.map((day) => [day.date, day.visits]));
  return (
    <section className={styles.week} aria-label="Consultations this week">
      {dates.map((date) => {
        const visits = orderVisits(byDate.get(date) ?? []);
        return (
          <Card key={date} padding="sm" className={styles.weekDay}>
            <SectionHeader
              as="h3"
              level={4}
              title={formatDay(date)}
              actions={
                <ButtonLink
                  size="sm"
                  variant="secondary"
                  href={scheduleHref({ ...query, date, mode: "day" })}
                >
                  View Day
                </ButtonLink>
              }
            />
            {date === today && (
              <Badge variant="soft" size="sm">
                Today
              </Badge>
            )}
            {visits.length ? (
              <ul className={styles.weekVisits}>
                {visits.map((visit) => (
                  <li key={visit.id}>
                    <Text variant="label" tone="heading">
                      {formatSlotTime(visit.startsAt)} ·{" "}
                      {patients.get(visit.patientId) ?? "Patient"}
                    </Text>
                    <Text variant="supporting" tone="muted">
                      {visit.reason}
                    </Text>
                  </li>
                ))}
              </ul>
            ) : (
              <Text variant="supporting" tone="muted">
                No consultations scheduled.
              </Text>
            )}
          </Card>
        );
      })}
    </section>
  );
}
