import assert from "node:assert/strict";
import { test } from "node:test";
import {
  nextPatient,
  readScheduleQuery,
  type ScheduledVisit,
  scheduleDates,
  scheduleHref,
  sessionMinutes,
} from "./schedule";

test("schedule dates reject rollover and use a Monday-based week across a month boundary", () => {
  assert.equal(
    readScheduleQuery({ date: "2026-02-30" }, "2026-11-23").date,
    "2026-11-23",
  );
  const week = readScheduleQuery(
    { period: "week", date: "2026-01-01" },
    "2026-11-23",
  );
  const dates = scheduleDates(week);
  assert.equal(dates.length, 7);
  assert.equal(dates[0], "2025-12-29");
  assert.equal(dates.at(-1), "2026-01-04");
  assert.equal(
    scheduleHref(week),
    "/clinic?view=queue&date=2026-01-01&period=week",
  );
});

test("call-next only selects eligible visits and uses clinic-local time ordering", () => {
  const make = (
    id: string,
    startsAt: string,
    status: ScheduledVisit["status"],
  ): ScheduledVisit => ({ id, startsAt, status, patientId: id, reason: "" });
  assert.equal(
    nextPatient([
      make("scheduled", "08:00", "scheduled"),
      make("completed", "08:30", "completed"),
      make("called", "09:00", "called"),
      make("later", "11:00", "waiting"),
      make("earliest", "10:00", "checked_in"),
    ])?.id,
    "earliest",
  );
  assert.equal(
    sessionMinutes("2026-11-23T10:00:00Z", Date.parse("2026-11-23T10:18:59Z")),
    18,
  );
  assert.equal(sessionMinutes("invalid", 0), null);
});
