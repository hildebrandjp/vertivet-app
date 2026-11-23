import assert from "node:assert/strict";
import { test } from "node:test";
import type { ClinicalPatient, PracticeOverview } from "./model";
import {
  directoryCsv,
  readRegistryQuery,
  registryHref,
  selectDemoRegistry,
} from "./registry";

const luna: ClinicalPatient = {
  id: "luna",
  name: "Luna",
  owner: "Alex Rivers",
  ownerId: "alex",
  breed: "Golden Retriever",
  species: "dog",
  chip: "98514108291",
};
const milo: ClinicalPatient = {
  ...luna,
  id: "milo",
  name: "Milo",
  species: "cat",
  chip: "98523044112",
  vaccination: { status: "due", label: "Booster due" },
};
const overview: PracticeOverview = {
  date: "2026-11-23",
  clinicName: "",
  room: "",
  counts: { booked: 0, patients: 2, owners: 1, reports: 0 },
  patients: [luna, milo],
  queue: [],
  alerts: [],
  entries: [],
};

test("registry filters by species and formatted chip while retaining correct counts", () => {
  const query = readRegistryQuery({
    q: " 985-2304 ",
    species: "cat",
    tab: "due",
    page: "50",
  });
  assert.equal(
    registryHref(query),
    "/clinic?view=patients&tab=due&species=cat&q=985-2304&page=50",
  );
  const result = selectDemoRegistry(overview, query);
  assert.equal(result.page, 1);
  assert.deepEqual(result.counts, { all: 1, owners: 1, due: 1 });
  assert.deepEqual(
    result.patients.map(({ id }) => id),
    ["milo"],
  );
  const owners = selectDemoRegistry(
    overview,
    readRegistryQuery({ view: "owners" }),
  );
  assert.equal(owners.total, 1);
  assert.deepEqual(owners.owners[0].pets, ["Luna", "Milo"]);
});

test("CSV quotes values and neutralizes spreadsheet formulas", () => {
  const csv = directoryCsv([
    {
      id: "owner",
      name: ' =HYPERLINK("unsafe")',
      phone: "+1 (555) 234-5678",
      pets: ["Luna, Jr.", "Milo"],
    },
  ]);
  assert.equal(
    csv,
    '"Owner","Email","Phone","Patients"\r\n"\' =HYPERLINK(""unsafe"")","","\'+1 (555) 234-5678","Luna, Jr.; Milo"\r\n',
  );
});
