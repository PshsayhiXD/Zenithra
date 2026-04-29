import type { Statement } from "better-sqlite3";
import { getDatabase } from "@getDatabase";
import type {
  CooldownCommand,
  CooldownExpiresAt,
  CooldownRow,
  CooldownUserId,
} from "@database/types/cooldown";

const database = getDatabase();

export const getCooldownStmt: Statement<
  [CooldownUserId, CooldownCommand],
  CooldownRow
> = database.prepare(
  "SELECT * FROM cooldowns WHERE userId = ? AND command = ?",
);

export const setCooldownStmt: Statement<
  [CooldownUserId, CooldownCommand, CooldownExpiresAt]
> = database.prepare(`
  INSERT INTO cooldowns (userId, command, expiresAt)
  VALUES (?, ?, ?)
  ON CONFLICT (userId, command) DO UPDATE SET expiresAt = excluded.expiresAt
`);

export const deleteCooldownStmt: Statement<[CooldownUserId, CooldownCommand]> =
  database.prepare("DELETE FROM cooldowns WHERE userId = ? AND command = ?");

export const pruneExpiredStmt: Statement<
  [CooldownExpiresAt],
  {
    changes: number;
  }
> = database.prepare("DELETE FROM cooldowns WHERE expiresAt <= ?");
