import assert from "node:assert/strict";
import { test } from "node:test";
import { canChangeAppointment } from "../../_lib/data/appointment-policy";
import type { Appointment } from "../../_lib/data/types";
import { readVisitQuery, selectVisits } from "./visits";

const now = Date.parse("2026-11-23T12:00:00Z");
const visit: Appointment = {
  id: "v1",
  petId: "milo",
  service: "Wellness exam",
  provider: "Dr. Emma Wilson",
  serviceId: "checkup",
  startsAt: "2026-11-24T09:00:00Z",
  status: "confirmed",
};

test("visit counts respect search and pet filters while pages stay in range", () => {
  const visits: Appointment[] = [
    visit,
    {
      ...visit,
      id: "v2",
      startsAt: "2026-11-21T09:00:00Z",
      status: "completed",
    },
    { ...visit, id: "v3", petId: "luna", status: "cancelled" },
  ];
  const query = readVisitQuery({ pet: "milo", q: "  WILSON ", page: "99" });
  const result = selectVisits(visits, query, now, 1);
  assert.deepEqual(result.counts, {
    all: 2,
    upcoming: 1,
    completed: 1,
    cancelled: 0,
  });
  assert.equal(result.currentPage, 2);
  assert.deepEqual(
    result.rows.map(({ id }) => id),
    ["v2"],
  );

  const upcoming = selectVisits(
    visits,
    { ...query, filter: "upcoming" },
    now,
    1,
  );
  assert.deepEqual(
    upcoming.rows.map(({ id }) => id),
    ["v1"],
  );
});

test("only future visits can be modified and rescheduling needs a service", () => {
  assert.equal(canChangeAppointment(visit, "reschedule", now), true);
  assert.equal(
    canChangeAppointment({ ...visit, serviceId: undefined }, "reschedule", now),
    false,
  );
  assert.equal(canChangeAppointment(visit, "confirm", now), false);
  assert.equal(
    canChangeAppointment({ ...visit, status: "pending" }, "confirm", now),
    true,
  );
  assert.equal(
    canChangeAppointment({ ...visit, status: "cancelled" }, "cancel", now),
    false,
  );
  assert.equal(
    canChangeAppointment(
      { ...visit, startsAt: new Date(now).toISOString() },
      "cancel",
      now,
    ),
    false,
  );
});
