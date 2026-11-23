import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.alterTable("patients", (table) => {
    table.index(["clinic_id", "name", "id"], "patients_clinic_name_id");
  });
}

export async function down(db: Knex) {
  await db.schema.alterTable("patients", (table) => {
    table.dropIndex(["clinic_id", "name", "id"], "patients_clinic_name_id");
  });
}
