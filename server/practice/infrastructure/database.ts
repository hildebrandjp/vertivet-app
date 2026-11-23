import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type Database from "better-sqlite3";
import knex, { type Knex } from "knex";
import * as listIndexes from "./list-indexes";
import * as initialMigration from "./migration";

export function openDatabase(
  filename = process.env.VERTIVET_DB_PATH || ".data/vertivet.sqlite3",
): Knex {
  const location =
    filename === ":memory:"
      ? filename
      : resolve(/* turbopackIgnore: true */ filename);
  if (location !== ":memory:")
    mkdirSync(dirname(location), { recursive: true });
  return knex({
    client: "better-sqlite3",
    connection: { filename: location },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 1,
      afterCreate(
        connection: Database.Database,
        done: (error: Error | null, connection: Database.Database) => void,
      ) {
        try {
          connection.pragma("foreign_keys = ON");
          connection.pragma("busy_timeout = 5000");
          if (location !== ":memory:") connection.pragma("journal_mode = WAL");
          done(null, connection);
        } catch (error) {
          done(
            error instanceof Error
              ? error
              : new Error("Could not configure SQLite."),
            connection,
          );
        }
      },
    },
  });
}

const migrations = {
  "001-practice": initialMigration,
  "002-list-indexes": listIndexes,
};

const migrationSource: Knex.MigrationSource<keyof typeof migrations> = {
  getMigrations: async () => ["001-practice", "002-list-indexes"],
  getMigrationName: (migration) => migration,
  getMigration: async (migration) => migrations[migration],
};

export async function migrate(db: Knex) {
  await db.migrate.latest({ migrationSource });
}
