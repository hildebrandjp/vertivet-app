import type { PracticeOverview } from "./model";
import {
  type ClinicSchedule,
  type ScheduledVisit,
  shiftScheduleDate,
} from "./schedule";

export interface DemoWalkIn {
  id: string;
  patientId: string;
  date: string;
  startsAt: string;
  reason: string;
}

export function isDemoWalkIn(value: unknown): value is DemoWalkIn {
  if (!value || typeof value !== "object") return false;
  const visit = value as Partial<DemoWalkIn>;
  return (
    [visit.id, visit.patientId, visit.reason].every(
      (field) => typeof field === "string",
    ) &&
    typeof visit.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(visit.date) &&
    typeof visit.startsAt === "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(visit.startsAt)
  );
}

export function demoSchedule(
  overview: PracticeOverview,
  dates: string[],
  walkIns: DemoWalkIn[],
): ClinicSchedule {
  const today = overview.date;
  const days = dates.map((date) => {
    let visits: ScheduledVisit[] = [];
    if (date === today) {
      visits = [
        {
          id: "visit-toby",
          patientId: "toby",
          startsAt: "09:30",
          reason: "Walk-in Triage Check",
          status: "completed",
          durationMinutes: 30,
          detail: "Completed and discharged",
        },
        ...overview.queue.map(
          (visit): ScheduledVisit => ({
            ...visit,
            durationMinutes: 30,
            ...(visit.status === "in_exam" && { elapsedMinutes: 18 }),
            ...(visit.patientId === "luna" || visit.patientId === "milo"
              ? { roomId: "suite-2" }
              : visit.patientId === "cleo"
                ? { roomId: "suite-1" }
                : {}),
          }),
        ),
      ];
    } else if (date === shiftScheduleDate(today, 1)) {
      visits = [
        {
          id: "visit-oliver-week",
          patientId: "oliver",
          startsAt: "10:30",
          reason: "Wellness Check",
          status: "scheduled",
          durationMinutes: 30,
          roomId: "suite-1",
        },
      ];
    }
    if (date !== today) {
      visits.push(
        ...walkIns
          .filter((visit) => visit.date === date)
          .map(
            (visit): ScheduledVisit => ({
              ...visit,
              status: "checked_in",
              detail: "Walk-in",
            }),
          ),
      );
    }

    return { date, visits };
  });
  return {
    days,
    rooms: dates.includes(today)
      ? [
          {
            id: "suite-1",
            name: "Exam Suite 1",
            clinician: "Dr. Emma Wilson",
            status: "available",
            detail: "Next: Cleo at 11:30 AM",
          },
          {
            id: "suite-2",
            name: "Exam Suite 2",
            clinician: "Dr. Sarah Jenkins",
            status: "in_session",
          },
          {
            id: "surgery-a",
            name: "Surgery Suite A",
            clinician: "Dr. Robert Hayes",
            status: "sterilizing",
            detail: "Next procedure at 1:30 PM",
          },
        ]
      : [],
    patients: overview.patients,
    entries: overview.entries,
    walkInPatients: overview.patients.map(({ id, name, owner }) => ({
      id,
      name,
      owner,
    })),
  };
}
