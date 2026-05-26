import type { Client } from "discord.js";
import { migrationDefinitions } from "@Rmigrations/index/index.js";
import {
  registerMigrationHandlers,
  runClientMigrations,
} from "@Rmigrations/shared/runtime.js";

export const registerRuntimeMigrations = (): void => {
  registerMigrationHandlers(migrationDefinitions);
};

export const executeRuntimeMigrations = async (
  client: Client,
): Promise<Record<string, string>> => {
  const result = await runClientMigrations(client, migrationDefinitions);
  return result;
};
