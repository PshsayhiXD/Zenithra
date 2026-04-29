import type {
  EconomyBank,
  EconomyCurrency,
  EconomyRow,
  EconomyStreak,
  EconomyStreakRow,
  EconomyUpdatedAt,
  EconomyUserId,
} from "@tables/types/economy/index.js";
import { CURRENCY } from "@config/currency.js";
import type { RunResult, Statement } from "better-sqlite3";
import { getDatabase } from "@database/index.js";

const database = getDatabase();

export const getEconomyStmt: Statement<[EconomyUserId], EconomyRow> = database.prepare(
  "SELECT * FROM economy WHERE userId = ?",
);

export const getStreakStmt: Statement<[EconomyUserId], EconomyStreakRow> = database.prepare(
  "SELECT * FROM streak WHERE userId = ?",
);

export const upsertStreakStmt: Statement<
  [EconomyUserId, EconomyStreak, EconomyUpdatedAt],
  RunResult
> = database.prepare(`
  INSERT INTO streak (userId, streak, updatedAt)
  VALUES (?, ?, ?)
  ON CONFLICT (userId) DO UPDATE SET
    streak = excluded.streak,
    updatedAt = excluded.updatedAt
`);

export const upsertEconomyStmt: Statement<
  [EconomyUserId, EconomyCurrency, EconomyUpdatedAt],
  RunResult
> = database.prepare(`
  INSERT INTO economy (userId, ${CURRENCY.NAME}, updatedAt)
  VALUES (?, ?, ?)
  ON CONFLICT (userId) DO UPDATE SET
    ${CURRENCY.NAME} = excluded.${CURRENCY.NAME},
    updatedAt = excluded.updatedAt
`);

export const updateBalancesStmt: Statement<
  [EconomyCurrency, EconomyBank, EconomyUpdatedAt, EconomyUserId],
  RunResult
> = database.prepare(`
  UPDATE economy SET
    ${CURRENCY.NAME} = ${CURRENCY.NAME} + ?,
    bank = bank + ?,
    updatedAt = ?
  WHERE userId = ?
`);

export const updateWalletStmt: Statement<
  [EconomyCurrency, EconomyUpdatedAt, EconomyUserId],
  RunResult
> = database.prepare(`
  UPDATE economy SET
    ${CURRENCY.NAME} = ${CURRENCY.NAME} + ?,
    updatedAt = ?
  WHERE userId = ?
`);
