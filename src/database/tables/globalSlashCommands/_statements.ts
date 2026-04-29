import { getDatabase } from "@database/index";
import type {
    GlobalSlashCommandHashCache,
    GlobalSlashCommandRow,
} from "@database/types/globalSlashCommands";
import type { Statement } from "better-sqlite3";

const database = getDatabase();

export const getGlobalSlashCommandStmt: Statement<[], GlobalSlashCommandRow> =
  database.prepare("SELECT id, hashCache FROM globalSlashCommands LIMIT 1");

export const setGlobalSlashCommandStmt: Statement<
  [GlobalSlashCommandHashCache]
> = database.prepare("INSERT INTO globalSlashCommands (id, hashCache) VALUES (1, ?)");

export const deleteGlobalSlashCommandStmt: Statement<[]> = database.prepare(
  "DELETE FROM globalSlashCommands",
);
