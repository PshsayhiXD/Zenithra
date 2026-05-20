import type { Client } from "discord.js";
import type { MigrationDefinition } from "@Rmigrations/shared/types.js";

export const registerMigrationHandlers = (
  migrations: MigrationDefinition[],
): void => {
  for (const migration of migrations) {
    migration.registerHandlers();
  }
};

export const runClientMigrations = async (
  client: Client,
  migrations: MigrationDefinition[],
): Promise<Record<string, string>> => {
  const results: Record<string, string> = {};
  for (const migration of migrations) {
    const result = await migration.run(client);
    results[migration.id] = String(result);
  }
  return results;
};
