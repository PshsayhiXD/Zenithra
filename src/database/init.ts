import { getDatabase } from "@getDatabase";
import {
    markAllMigrationsAsApplied,
    runPendingMigrations,
} from "@database/migrate.js";
const database = getDatabase();

const hasGuildsTableStmt = database.prepare<[], { name: string }>(
  "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'guilds'",
);

export const initDatabase = (): string[] => {
  const isFresh = !hasGuildsTableStmt.get();
  if (isFresh) {
    markAllMigrationsAsApplied();
    return [];
  }
  return runPendingMigrations();
};