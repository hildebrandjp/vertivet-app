import { randomUUID } from "node:crypto";
import { normalizeEmail } from "@/app/shared/forms/normalize";
import { isEmail } from "@/app/shared/forms/validation";
import { hashPassword } from "../server/practice/application/practice";
import {
  migrate,
  openDatabase,
} from "../server/practice/infrastructure/database";
import { LIMITS, MEMBERSHIP_ROLE } from "../shared/practice/contracts";

const COMMAND = { migrate: "migrate", seed: "seed" } as const;
const MIN_SEED_PASSWORD_LENGTH = 12;
const DEMO_CLINICS = [
  { slug: "demo-central", name: "VertiVet Central" },
  { slug: "demo-north", name: "VertiVet North" },
] as const;
const DEMO_CLINIC_IDS = DEMO_CLINICS.map(({ slug }) => slug);

async function setup() {
  const command = process.argv[2];
  if (command !== COMMAND.migrate && command !== COMMAND.seed)
    throw new Error("Use migrate or seed.");
  const db = openDatabase();
  try {
    await migrate(db);
    if (command === COMMAND.migrate) {
      console.log("Practice database migrations are up to date.");
      return;
    }
    const email = normalizeEmail(process.env.VERTIVET_SEED_EMAIL ?? "");
    const password = process.env.VERTIVET_SEED_PASSWORD;
    if (
      !email ||
      !isEmail(email) ||
      email.length > LIMITS.email ||
      !password ||
      password.length < MIN_SEED_PASSWORD_LENGTH ||
      password.length > LIMITS.password
    ) {
      throw new Error(
        `Set VERTIVET_SEED_EMAIL and VERTIVET_SEED_PASSWORD (${MIN_SEED_PASSWORD_LENGTH}–${LIMITS.password} characters).`,
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
            .whereNotIn("clinic_id", DEMO_CLINIC_IDS)
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
      for (const clinic of DEMO_CLINICS) {
        const { slug } = clinic;
        await trx("clinics")
          .insert({ id: slug, ...clinic })
          .onConflict("id")
          .ignore();
        await trx("memberships")
          .insert({
            clinic_id: slug,
            user_id: userId,
            role: MEMBERSHIP_ROLE.administrator,
          })
          .onConflict(["clinic_id", "user_id"])
          .ignore();
      }
    });
    console.log(
      `Demo clinics ready. Sign in with ${DEMO_CLINIC_IDS.join(" or ")} and the supplied credentials.`,
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
