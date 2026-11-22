import assert from "node:assert/strict";
import { test } from "node:test";
import { createBookingCalendar } from "./booking-export";
import type { BookingConfirmationData } from "./confirmation";

const booking: BookingConfirmationData = {
  id: "VST-99281",
  status: "confirmed",
  bookedAt: "2026-11-22T12:15:00.000Z",
  timeZone: "Asia/Singapore",
  emailSent: false,
  pet: { name: "Max", breed: "Golden Retriever" },
  service: { name: "Wellness Exam", durationMinutes: 45 },
  date: "2026-11-24",
  time: "23:45",
  notes: "",
  location: "Clinic, Station 4",
};

test("calendar preserves clinic time and duration across midnight", () => {
  const calendar = createBookingCalendar(booking);
  assert.ok(
    calendar.includes("DTSTART;TZID=Asia/Singapore:20261124T234500\r\n"),
  );
  assert.ok(calendar.includes("DURATION:PT45M\r\n"));
  assert.ok(calendar.includes("DTSTAMP:20261122T121500Z\r\n"));
  assert.ok(calendar.includes("LOCATION:Clinic\\, Station 4\r\n"));
});

test("pending requests remain tentative and UTC exports have an explicit Z", () => {
  const calendar = createBookingCalendar({
    ...booking,
    timeZone: "UTC",
    status: "pending",
  });
  assert.ok(calendar.includes("DTSTART:20261124T234500Z\r\n"));
  assert.ok(calendar.includes("STATUS:TENTATIVE\r\n"));
});

test("untrusted notes cannot inject calendar fields and UTF-8 lines are folded safely", () => {
  const calendar = createBookingCalendar({
    ...booking,
    notes: `hello;there\\\r\nEND:VEVENT\r\nSUMMARY:forged ${"🐾".repeat(100)}`,
  });
  assert.equal(calendar.split("\r\nEND:VEVENT").length, 2);
  assert.equal(calendar.split("\r\nSUMMARY:").length, 2);
  for (const line of calendar.split("\r\n")) {
    assert.ok(new TextEncoder().encode(line).length <= 75);
    assert.ok(!line.includes("�"));
  }
  const unfolded = calendar.replaceAll("\r\n ", "");
  assert.ok(
    unfolded.includes("hello\\;there\\\\\\nEND:VEVENT\\nSUMMARY:forged"),
  );
});
