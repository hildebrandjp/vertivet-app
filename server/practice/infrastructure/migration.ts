import type { Knex } from "knex";

export async function up(db: Knex) {
  await db.schema.createTable("clinics", (table) => {
    table.string("id").primary();
    table.string("slug").notNullable().unique();
    table.string("name").notNullable();
  });
  await db.schema.createTable("users", (table) => {
    table.string("id").primary();
    table.string("email").notNullable().unique();
    table.string("name").notNullable();
    table.string("password_hash").notNullable();
  });
  await db.schema.createTable("memberships", (table) => {
    table.string("clinic_id").notNullable().references("clinics.id");
    table.string("user_id").notNullable().references("users.id");
    table.enu("role", ["administrator", "veterinarian", "staff"]).notNullable();
    table.primary(["clinic_id", "user_id"]);
  });
  await db.schema.createTable("sessions", (table) => {
    table.string("token_hash").primary();
    table.string("clinic_id").notNullable();
    table.string("user_id").notNullable();
    table.string("expires_at").notNullable().index();
    table
      .foreign(["clinic_id", "user_id"])
      .references(["clinic_id", "user_id"])
      .inTable("memberships")
      .onDelete("CASCADE");
  });
  await db.schema.createTable("clients", (table) => {
    table.string("clinic_id").notNullable().references("clinics.id");
    table.string("id").notNullable();
    table.string("name").notNullable();
    table.string("email");
    table.primary(["clinic_id", "id"]);
    table.unique(["clinic_id", "email"]);
  });
  await db.schema.createTable("patients", (table) => {
    table.string("clinic_id").notNullable();
    table.string("id").notNullable();
    table.string("client_id").notNullable();
    table.string("name").notNullable();
    table
      .enu("species", ["dog", "cat", "rabbit", "bird", "other"])
      .notNullable();
    table.primary(["clinic_id", "id"]);
    table
      .foreign(["clinic_id", "client_id"])
      .references(["clinic_id", "id"])
      .inTable("clients");
    table.index(["clinic_id", "client_id"]);
  });
  await db.schema.createTable("appointments", (table) => {
    table.string("clinic_id").notNullable();
    table.string("id").notNullable();
    table.string("patient_id").notNullable();
    table.string("starts_at").notNullable();
    table.string("reason").notNullable();
    table.primary(["clinic_id", "id"]);
    table
      .foreign(["clinic_id", "patient_id"])
      .references(["clinic_id", "id"])
      .inTable("patients");
    table.unique(["clinic_id", "patient_id", "starts_at"]);
    table.index(["clinic_id", "starts_at"]);
  });
}

export async function down(db: Knex) {
  for (const table of [
    "appointments",
    "patients",
    "clients",
    "sessions",
    "memberships",
    "users",
    "clinics",
  ]) {
    await db.schema.dropTable(table);
  }
}
