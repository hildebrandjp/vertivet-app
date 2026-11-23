import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import type {
  Appointment,
  Member,
  Patient,
  PracticeStore,
} from "../application/practice";

export function knexPracticeStore(db: Knex): PracticeStore {
  const memberships = () =>
    db("memberships as m")
      .join("clinics as c", "c.id", "m.clinic_id")
      .join("users as u", "u.id", "m.user_id")
      .select(
        "m.clinic_id as clinicId",
        "c.name as clinic",
        "m.user_id as userId",
        "u.name",
      );
  return {
    credentials: (clinic, email) =>
      memberships()
        .where("c.slug", clinic)
        .where("u.email", email)
        .select("u.password_hash as passwordHash")
        .first(),
    async createSession(member: Member, hash, expires) {
      await db.transaction(async (trx) => {
        await trx("sessions")
          .where("expires_at", "<=", new Date().toISOString())
          .delete();
        await trx("sessions").insert({
          token_hash: hash,
          clinic_id: member.clinicId,
          user_id: member.userId,
          expires_at: expires,
        });
      });
    },
    session: (hash, now) =>
      memberships()
        .join("sessions as s", function () {
          this.on("s.clinic_id", "m.clinic_id").andOn("s.user_id", "m.user_id");
        })
        .where("s.token_hash", hash)
        .where("s.expires_at", ">", now)
        .first(),
    async revoke(hash) {
      await db("sessions").where("token_hash", hash).delete();
    },
    patients: (clinicId): Promise<Patient[]> =>
      db("patients as p")
        .join("clients as c", function () {
          this.on("c.clinic_id", "p.clinic_id").andOn("c.id", "p.client_id");
        })
        .where("p.clinic_id", clinicId)
        .select("p.id", "p.name", "p.species", "c.name as owner")
        .orderBy(["p.name", "p.id"])
        .limit(100),
    appointments: (clinicId): Promise<Appointment[]> =>
      db("appointments as a")
        .join("patients as p", function () {
          this.on("p.clinic_id", "a.clinic_id").andOn("p.id", "a.patient_id");
        })
        .where("a.clinic_id", clinicId)
        .where("a.starts_at", ">=", new Date().toISOString())
        .select(
          "a.id",
          "p.name as patient",
          "a.reason",
          "a.starts_at as startsAt",
        )
        .orderBy("a.starts_at")
        .limit(100),
    addPatient: (clinicId, input) =>
      db.transaction(async (trx) => {
        await trx("clients")
          .insert({
            clinic_id: clinicId,
            id: randomUUID(),
            name: input.owner,
            email: input.email,
          })
          .onConflict(["clinic_id", "email"])
          .ignore();
        const owner = await trx("clients")
          .where({ clinic_id: clinicId, email: input.email })
          .first();
        await trx("patients").insert({
          clinic_id: clinicId,
          id: input.id,
          client_id: owner.id,
          name: input.name,
          species: input.species,
        });
        return {
          id: input.id,
          name: input.name,
          species: input.species,
          owner: owner.name,
        };
      }),
    addAppointment: (clinicId, input) =>
      db.transaction(async (trx) => {
        const patient = await trx("patients")
          .where({ clinic_id: clinicId, id: input.patientId })
          .first();
        if (!patient) return undefined;
        const inserted = await trx("appointments")
          .insert({
            clinic_id: clinicId,
            id: input.id,
            patient_id: input.patientId,
            starts_at: input.startsAt,
            reason: input.reason,
          })
          .onConflict(["clinic_id", "patient_id", "starts_at"])
          .ignore()
          .returning("id");
        if (!inserted.length) return undefined;
        return {
          id: input.id,
          patient: patient.name,
          startsAt: input.startsAt,
          reason: input.reason,
        };
      }),
  };
}
