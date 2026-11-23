import {
  formatDay,
  formatFullDay,
  formatSlotTime,
} from "@/app/(app)/_lib/format";
import { Badge } from "@/app/shared/ui/Badge";
import { ButtonLink } from "@/app/shared/ui/Button";
import { Card } from "@/app/shared/ui/Card";
import { SectionHeader } from "@/app/shared/ui/SectionHeader";
import { Heading, Text } from "@/app/shared/ui/Typography";
import {
  type ClinicSchedule,
  nextPatient,
  type ScheduleQuery,
  scheduleDates,
  scheduleHref,
  shiftScheduleDate,
} from "../_lib/schedule";
import styles from "../schedule.module.css";
import { ClinicalAction } from "./ClinicalAction";
import { ScheduleRefresh } from "./ScheduleLive";
import { ScheduleDayTimeline, ScheduleWeek } from "./ScheduleTimeline";

const ROOM_STATUS = {
  available: { label: "Available", tone: "success" },
  in_session: { label: "In Session", tone: "primary" },
  sterilizing: { label: "Sterilizing", tone: "accent" },
} as const;

export function QueueSchedule({
  schedule,
  query,
  today,
  demo,
}: {
  schedule: ClinicSchedule;
  query: ScheduleQuery;
  today: string;
  demo: boolean;
}) {
  const week = query.mode === "week";
  const dates = scheduleDates(query);
  const day = schedule.days.find(({ date }) => date === query.date) ?? {
    date: query.date,
    visits: [],
  };
  const todayDay = schedule.days.find(({ date }) => date === today);
  const current = query.date === today && !week;
  const next = current ? nextPatient(day.visits) : undefined;
  const patientById = new Map(
    schedule.patients.map((patient) => [patient.id, patient]),
  );
  const nextName = next && patientById.get(next.patientId)?.name;
  const step = week ? 7 : 1;
  const navigationDate = (direction: number) =>
    scheduleHref({
      ...query,
      date: shiftScheduleDate(query.date, step * direction),
    });
  const currentVisits = new Map(
    (todayDay?.visits ?? [])
      .filter(({ roomId, status }) => roomId && status === "in_exam")
      .map((visit) => [visit.roomId, patientById.get(visit.patientId)]),
  );

  return (
    <>
      {!demo && dates.includes(today) && <ScheduleRefresh />}
      <SectionHeader
        as="h1"
        title={
          current
            ? "Today’s Consultation Schedule"
            : week
              ? "Weekly Consultation Schedule"
              : "Consultation Schedule"
        }
        description={
          week
            ? `${formatDay(dates[0])} – ${formatDay(dates[6])}`
            : `${formatFullDay(query.date)} · Patient room allocation and consult flow`
        }
        actions={
          current ? (
            <div className={styles.controls}>
              <ClinicalAction
                kind="walk_in"
                label="+ Walk-In"
                walkInPatients={schedule.walkInPatients}
              />
              {next && (
                <ClinicalAction
                  key={next.id}
                  kind="call"
                  id={next.id}
                  patient={nextName}
                  label={`Next: ${nextName ?? "Patient"} (${formatSlotTime(next.startsAt)}) →`}
                  variant="primary"
                />
              )}
            </div>
          ) : undefined
        }
      />
      {current && schedule.rooms.length > 0 && (
        <section className={styles.rooms} aria-label="Exam room status">
          {schedule.rooms.map((room) => {
            const status = ROOM_STATUS[room.status];
            const patient = currentVisits.get(room.id);
            return (
              <Card
                key={room.id}
                className={styles.room}
                data-active={room.status === "in_session" || undefined}
              >
                <div className={styles.controls}>
                  <Heading level={4} as="h2">
                    {room.name}
                  </Heading>
                  <Badge
                    tone={status.tone}
                    size="sm"
                    shape="pill"
                    variant={room.status === "in_session" ? "solid" : "soft"}
                  >
                    {status.label}
                  </Badge>
                </div>
                <Text variant="supporting" tone="muted">
                  {[
                    room.clinician,
                    patient && `Patient: ${patient.name} (${patient.owner})`,
                    room.detail,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </Card>
            );
          })}
        </section>
      )}
      <Card padding="lg" className={styles.panel}>
        <SectionHeader
          as="h2"
          level={3}
          title={
            week
              ? "Weekly Consultation Timeline"
              : `Consultation Timeline & Appointment Slots (${formatDay(query.date)})`
          }
          description={
            !demo && dates.includes(today)
              ? "Refreshes every 30 seconds while this page is visible."
              : undefined
          }
          actions={
            <ButtonLink
              href={scheduleHref({ ...query, mode: week ? "day" : "week" })}
              variant="secondary"
              size="sm"
            >
              {week ? "Day View" : "View Full Week →"}
            </ButtonLink>
          }
        />
        <nav aria-label="Schedule dates" className={styles.controls}>
          <ButtonLink href={navigationDate(-1)} variant="ghost" size="sm">
            Previous {week ? "Week" : "Day"}
          </ButtonLink>
          <ButtonLink
            href={scheduleHref({ ...query, date: today })}
            variant="secondary"
            size="sm"
            aria-current={query.date === today ? "date" : undefined}
          >
            Today
          </ButtonLink>
          <ButtonLink href={navigationDate(1)} variant="ghost" size="sm">
            Next {week ? "Week" : "Day"}
          </ButtonLink>
        </nav>
        {week ? (
          <ScheduleWeek
            schedule={schedule}
            query={query}
            dates={dates}
            today={today}
          />
        ) : (
          <ScheduleDayTimeline
            schedule={schedule}
            day={day}
            isToday={current}
          />
        )}
      </Card>
    </>
  );
}
