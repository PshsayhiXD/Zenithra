import type {
  EconomyDatabaseRow,
  EconomyStreak,
  EconomyStreakRow,
  EconomyUpdatedAt,
  EconomyUserId,
} from "@tables/types/economy/index.js";
import { CURRENCY } from "@configs/currency.js";
import type { RunResult, Statement } from "better-sqlite3";
import { getDatabase } from "@databases/index.js";

const database = getDatabase();

export const getEconomyStmt: Statement<[EconomyUserId], EconomyDatabaseRow> = database.prepare(
  "SELECT * FROM economy WHERE userId = ?",
);

export const getStreakStmt: Statement<[EconomyUserId], EconomyStreakRow> = database.prepare(
  "SELECT streak, updatedAt FROM economy WHERE userId = ?",
);

export const upsertStreakStmt: Statement<
  [EconomyUserId, EconomyStreak, EconomyUpdatedAt],
  RunResult
> = database.prepare(`
  INSERT INTO economy (userId, streak, updatedAt)
  VALUES (?, ?, ?)
  ON CONFLICT (userId) DO UPDATE SET
    streak = excluded.streak,
    updatedAt = excluded.updatedAt
`);

export const upsertEconomyStmt: Statement<
  [EconomyUserId, string, EconomyUpdatedAt],
  RunResult
> = database.prepare(`
  INSERT INTO economy (userId, ${CURRENCY.COLUMN_NAME}, updatedAt)
  VALUES (?, ?, ?)
  ON CONFLICT (userId) DO UPDATE SET
    ${CURRENCY.COLUMN_NAME} = excluded.${CURRENCY.COLUMN_NAME},
    updatedAt = excluded.updatedAt
`);

export const updateBalancesStmt: Statement<
  [string, string, EconomyUpdatedAt, EconomyUserId],
  RunResult
> = database.prepare(`
  UPDATE economy SET
    ${CURRENCY.COLUMN_NAME} = ?,
    bank = ?,
    updatedAt = ?
  WHERE userId = ?
`);

export const updateWalletStmt: Statement<
  [string, EconomyUpdatedAt, EconomyUserId],
  RunResult
> = database.prepare(`
  UPDATE economy SET
    ${CURRENCY.COLUMN_NAME} = ?,
    updatedAt = ?
  WHERE userId = ?
`);
