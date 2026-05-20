import type { Client } from "discord.js";
import type { MigrationDefinition } from "@Rmigrations/shared/types.js";
import { Cache } from "@utilities/cache.js";

type MigrationState = Record<string, string>;

const migrationCache = new Cache<MigrationState>(
  "migrations",
  "file"
).init();

export const registerMigrationHandlers = (
  migrations: MigrationDefinition[],
): void => {
  for (const migration of migrations) migration.registerHandlers();
};

export const runClientMigrations = async (
  client: Client,
  migrations: MigrationDefinition[],
): Promise<Record<string, string>> => {
  const state = migrationCache.get("executed") ?? {};
  const results: MigrationState = { ...state };
  let changed = false;

  for (const migration of migrations) {
    if (state[migration.id] !== undefined) continue;

    const result = await migration.run(client);

    results[migration.id] = String(result);
    state[migration.id] = String(result);

    changed = true;
  }

  if (changed) migrationCache.set("executed", state);

  return results;
};
