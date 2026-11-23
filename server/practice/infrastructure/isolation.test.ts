import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, practice } from "../application/practice";
import { runPracticeGraphQL } from "../graphql/schema";
import { migrate, openDatabase } from "./database";
import { knexPracticeStore } from "./store";

test("SQLite and GraphQL isolate clinic data and revoke sessions", async () => {
  const db = openDatabase(":memory:");
  try {
    await migrate(db);
    await migrate(db);
    await db("clinics").insert([
      { id: "a", slug: "alpha", name: "Alpha" },
      { id: "b", slug: "beta", name: "Beta" },
    ]);
    const password = "fixture-password";
    await db("users").insert({
      id: "u",
      email: "staff@example.test",
      name: "Staff",
      password_hash: await hashPassword(password),
    });
    await db("memberships").insert([
      { clinic_id: "a", user_id: "u", role: "staff" },
      { clinic_id: "b", user_id: "u", role: "staff" },
    ]);
    const service = practice(knexPracticeStore(db));
    const alpha = await service.signIn("alpha", "staff@example.test", password);
    const beta = await service.signIn("beta", "staff@example.test", password);
    await assert.rejects(
      service.signIn("other", "staff@example.test", password),
      /Invalid clinic or credentials/,
    );

    const write = await runPracticeGraphQL(
      service,
      {
        query:
          'mutation { registerPatient(name:"Luna", species:dog, owner:"Owner", email:"owner@example.test") { id } }',
      },
      alpha,
    );
    assert.equal(write.result.errors, undefined);
    const patient = await db("patients").where({ clinic_id: "a" }).first();
    assert(patient);
    const read = await runPracticeGraphQL(
      service,
      { query: "{ me { clinic } patients { name } }" },
      beta,
    );
    assert.equal(read.result.errors, undefined);
    assert.deepEqual(JSON.parse(JSON.stringify(read.result)), {
      data: { me: { clinic: "Beta" }, patients: [] },
    });

    const startsAt = new Date(Date.now() + 86_400_000).toISOString();
    const book = {
      query:
        'mutation($id:ID!,$time:String!){bookAppointment(patientId:$id, startsAt:$time, reason:"Checkup"){id}}',
      variables: { id: patient.id, time: startsAt },
    };
    assert.match(
      (await runPracticeGraphQL(service, book, beta)).result.errors?.[0]
        .message ?? "",
      /unavailable/,
    );
    assert.equal(
      (await runPracticeGraphQL(service, book, alpha)).result.errors,
      undefined,
    );
    assert.match(
      (await runPracticeGraphQL(service, book, alpha)).result.errors?.[0]
        .message ?? "",
      /already booked/,
    );
    await assert.rejects(
      db("appointments").insert({
        clinic_id: "b",
        id: "wrong",
        patient_id: patient.id,
        starts_at: startsAt,
        reason: "Checkup",
      }),
      /FOREIGN KEY/,
    );

    const logout = await runPracticeGraphQL(
      service,
      { query: "mutation { signOut }" },
      alpha,
    );
    assert.equal(logout.nextToken, null);
    assert.equal(await service.member(alpha), undefined);
    assert(await service.member(beta));
  } finally {
    await db.destroy();
  }
});
