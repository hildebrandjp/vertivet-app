import { randomUUID } from "node:crypto";
import { hashPassword } from "../server/practice/application/practice";
import {
  migrate,
  openDatabase,
} from "../server/practice/infrastructure/database";

async function setup() {
  const command = process.argv[2];
  if (command !== "migrate" && command !== "seed")
    throw new Error("Use migrate or seed.");
  const db = openDatabase();
  try {
    await migrate(db);
    if (command === "migrate") {
      console.log("Practice database migrations are up to date.");
      return;
    }
    const email = process.env.VERTIVET_SEED_EMAIL?.trim().toLowerCase();
    const password = process.env.VERTIVET_SEED_PASSWORD;
    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      !password ||
      password.length < 12 ||
      password.length > 256
    ) {
      throw new Error(
        "Set VERTIVET_SEED_EMAIL and VERTIVET_SEED_PASSWORD (12–256 characters).",
      );
    }
    const passwordHash = await hashPassword(password);
    await db.transaction(async (trx) => {
      const existing = await trx("users").where({ email }).first();
      const userId = existing?.id ?? randomUUID();
      if (existing) {
        if (
          await trx("memberships")
            .where({ user_id: userId })
            .whereNotIn("clinic_id", ["demo-central", "demo-north"])
            .first()
        ) {
          throw new Error(
            "Choose a seed email that does not belong to a non-demo clinic.",
          );
        }
        await trx("users")
          .where({ id: userId })
          .update({ password_hash: passwordHash });
        await trx("sessions").where({ user_id: userId }).delete();
      } else
        await trx("users").insert({
          id: userId,
          email,
          name: "Demo Clinician",
          password_hash: passwordHash,
        });
      for (const slug of ["demo-central", "demo-north"]) {
        await trx("clinics")
          .insert({
            id: slug,
            slug,
            name:
              slug === "demo-central" ? "VertiVet Central" : "VertiVet North",
          })
          .onConflict("id")
          .ignore();
        await trx("memberships")
          .insert({ clinic_id: slug, user_id: userId, role: "administrator" })
          .onConflict(["clinic_id", "user_id"])
          .ignore();
      }
    });
    console.log(
      "Demo clinics ready. Sign in with demo-central or demo-north and the supplied credentials.",
    );
  } finally {
    await db.destroy();
  }
}

setup().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Database setup failed.",
  );
  process.exitCode = 1;
});
