import assert from "node:assert/strict";
import { test } from "node:test";
import { type PracticeOperations, validateSettingsPatch } from "./settings";

const operations: PracticeOperations = {
  consultationMinutes: 30,
  cleanupMinutes: 5,
  opensAt: "08:00",
  closesAt: "18:00",
  triageStartsAt: "08:00",
  triageEndsAt: "09:30",
  audioAlert: true,
  allocations: [{ roomId: "one", staffId: "vet" }],
  roster: [{ staffId: "vet", startsAt: "08:00", endsAt: "16:00" }],
  formulary: [{ id: "oral", enabled: true }],
};

test("settings validation permits independent profile or operations updates", () => {
  assert.deepEqual(
    validateSettingsPatch({ profile: { title: " Vet ", license: " X1 " } }),
    {
      profile: { title: "Vet", license: "X1" },
    },
  );
  assert.deepEqual(validateSettingsPatch({ operations }), { operations });
});

test("settings validation rejects out-of-hours triage, duplicate room allocations and invalid shifts", () => {
  assert.match(
    String(
      validateSettingsPatch({
        operations: { ...operations, triageStartsAt: "07:30" },
      }),
    ),
    /within clinic operating hours/,
  );
  assert.match(
    String(
      validateSettingsPatch({
        operations: {
          ...operations,
          allocations: [...operations.allocations, ...operations.allocations],
        },
      }),
    ),
    /room assignments/,
  );
  assert.match(
    String(
      validateSettingsPatch({
        operations: {
          ...operations,
          roster: [{ staffId: "vet", startsAt: "17:00", endsAt: "08:00" }],
        },
      }),
    ),
    /roster/,
  );
});
