import type { Statement } from "better-sqlite3";
import { getDatabase } from "@getDatabase";
import type {
  CooldownNamespace,
  CooldownExpiresAt,
  CooldownRow,
  CooldownUserId,
} from "@tables/types/cooldown/index.js";

const database = getDatabase();

export const getCooldownStmt: Statement<
  [CooldownUserId, CooldownNamespace],
  CooldownRow
> = database.prepare(
  "SELECT * FROM cooldowns WHERE userId = ? AND namespace = ?",
);

export const setCooldownStmt: Statement<
  [CooldownUserId, CooldownNamespace, CooldownExpiresAt]
> = database.prepare(`
  INSERT INTO cooldowns (userId, namespace, expiresAt)
  VALUES (?, ?, ?)
  ON CONFLICT (userId, namespace) DO UPDATE SET expiresAt = excluded.expiresAt
`);

export const deleteCooldownStmt: Statement<[CooldownUserId, CooldownNamespace]> =
  database.prepare("DELETE FROM cooldowns WHERE userId = ? AND namespace = ?");

export const pruneExpiredStmt: Statement<
  [CooldownExpiresAt],
  {
    changes: number;
  }
> = database.prepare("DELETE FROM namespace WHERE expiresAt <= ?");
