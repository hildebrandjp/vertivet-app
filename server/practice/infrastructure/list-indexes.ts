import type { Knex } from "knex";

const PATIENT_LIST_INDEX = {
  columns: ["clinic_id", "name", "id"],
  name: "patients_clinic_name_id",
};

export async function up(db: Knex) {
  await db.schema.alterTable("patients", (table) => {
    table.index(PATIENT_LIST_INDEX.columns, PATIENT_LIST_INDEX.name);
  });
}

export async function down(db: Knex) {
  await db.schema.alterTable("patients", (table) => {
    table.dropIndex(PATIENT_LIST_INDEX.columns, PATIENT_LIST_INDEX.name);
  });
}
