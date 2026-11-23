import assert from "node:assert/strict";
import { test } from "node:test";
import { selectDemoClients } from "./client-directory";
import type { ClientRecord, PracticeOverview } from "./model";
import { readRegistryQuery, registryHref } from "./registry";

const overview: PracticeOverview = {
  date: "2026-11-23",
  clinicName: "",
  room: "",
  counts: { booked: 0, patients: 1, owners: 2, reports: 0 },
  patients: [
    { id: "pet", name: "Luna", owner: "Old Name", ownerId: "1", breed: "" },
  ],
  queue: [],
  alerts: [],
  entries: [],
};

const clients: ClientRecord[] = [
  {
    id: "1",
    name: "Alex Rivers",
    phone: "+1 (555) 234-5678",
    lastConsultationAt: "2026-11-01",
    status: "active",
  },
  {
    id: "2",
    name: "Pat Green",
    email: "pat@example.test",
    lastConsultationAt: "2026-10-24",
  },
];

test("client filters match contact formats, preserve family ties after contact edits, and include standalone clients", () => {
  const recent = readRegistryQuery({
    view: "owners",
    recent: "1",
    q: "555234",
    page: "10",
  });
  assert.equal(
    registryHref(recent),
    "/clinic?view=owners&recent=1&q=555234&page=10",
  );
  const result = selectDemoClients(overview, clients, recent);
  assert.equal(result.page, 1);
  assert.deepEqual(
    result.owners.map(({ name, pets }) => [name, pets]),
    [["Alex Rivers", ["Luna"]]],
  );
  assert.deepEqual(result.clientSummary, {
    registered: 2,
    associatedPets: 1,
    active: 1,
    recent: 1,
  });
  const standalone = selectDemoClients(
    overview,
    clients,
    readRegistryQuery({ view: "owners", q: "pat@example" }),
  );
  assert.deepEqual(standalone.owners[0].pets, []);
  assert.equal(
    selectDemoClients(overview, clients, { ...recent, query: "pat@example" })
      .total,
    0,
  );
});
