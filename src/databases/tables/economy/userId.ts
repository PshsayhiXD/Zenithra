import type {
  EconomyDatabaseRow,
  EconomyCurrency,
  EconomyRow,
  EconomyUserId,
} from "@tables/types/economy/index.js";
import { getEconomyStmt, upsertEconomyStmt } from "@tables/economy/_statements.js";
import { decimalToString } from "@utilities/currency.js";
import { Decimal } from "decimal.js";

const parseEconomyRow = (row: EconomyDatabaseRow): EconomyRow => ({
  ...row,
  currency: new Decimal(row.currency),
  bank: new Decimal(row.bank),
  bankCapacity: new Decimal(row.bankCapacity),
});

export const getEconomy = (userId: EconomyUserId): EconomyRow | undefined => {
  const row = getEconomyStmt.get(userId);
  return row === undefined ? undefined : parseEconomyRow(row);
};

export const upsertEconomy = (
  userId: EconomyUserId,
  currency: EconomyCurrency = new Decimal(0),
): EconomyRow => {
  const now = Date.now();
  upsertEconomyStmt.run(userId, decimalToString(currency), now);
  const row = getEconomy(userId);
  if (!row) throw new Error(`Failed to upsert economy for user: ${userId}`);
  return row;
};

export const getOrCreateEconomy = (userId: EconomyUserId): EconomyRow => getEconomy(userId) ?? upsertEconomy(userId);
