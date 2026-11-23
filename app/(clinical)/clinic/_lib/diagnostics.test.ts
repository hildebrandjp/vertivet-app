import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type ClinicalOrder,
  canAuthorizeRefill,
  canReleaseResult,
  orderHref,
  readOrderQuery,
  scanLink,
  selectDemoOrders,
} from "./diagnostics";

const patient = { id: "luna", name: "Luna", owner: "Alex Rivers" };
const lab: ClinicalOrder = {
  id: "lab",
  reference: "LAB-1",
  kind: "lab",
  patient,
  title: "CBC",
  status: "ready",
  result: "Report text",
};
const rx: ClinicalOrder = {
  id: "rx",
  reference: "RX-1",
  kind: "prescription",
  patient,
  title: "Prescription",
  status: "active",
  refillsRemaining: 1,
};

test("diagnostic counts and pagination honor search and order status", () => {
  const query = readOrderQuery({
    orders: "pending",
    q: "  LAB-1 ",
    page: "50",
  });
  assert.equal(
    orderHref(query),
    "/clinic?view=diagnostics&orders=pending&q=LAB-1&page=50",
  );
  const page = selectDemoOrders([lab, rx], [patient], query);
  assert.deepEqual(page.counts, { all: 1, pending: 1, completed: 0 });
  assert.equal(page.page, 1);
  assert.equal(page.orders[0].id, "lab");
  assert.deepEqual(page.summary, {
    pendingLab: 1,
    activeRx: 1,
    dispensed: 1,
    released: 0,
  });
});

test("release and refill require eligible records and scans require HTTPS", () => {
  assert.equal(canReleaseResult(lab), true);
  assert.equal(canReleaseResult({ ...lab, result: " " }), false);
  assert.equal(canReleaseResult({ ...lab, status: "released" }), false);
  assert.equal(canAuthorizeRefill(rx), true);
  assert.equal(canAuthorizeRefill({ ...rx, refillsRemaining: 0 }), false);
  assert.equal(canAuthorizeRefill({ ...rx, status: "draft" }), false);
  assert.equal(scanLink("javascript:alert(1)"), undefined);
  assert.equal(
    scanLink("https://example.test/report"),
    "https://example.test/report",
  );
});
