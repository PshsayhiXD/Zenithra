import type {
  EconomyCurrency,
  EconomyRow,
  EconomyUserId,
} from "@tables/types/economy/index.js";
import { getEconomyStmt, upsertEconomyStmt } from "@tables/economy/_statements.js";

export const getEconomy = (userId: EconomyUserId): EconomyRow | undefined => getEconomyStmt.get(userId) ?? undefined;

export const upsertEconomy = (userId: EconomyUserId, currency: EconomyCurrency = 0): EconomyRow => {
  const now = Date.now();
  upsertEconomyStmt.run(userId, currency, now);
  const row = getEconomy(userId);
  if (!row) throw new Error(`Failed to upsert economy for user: ${userId}`);
  return row;
};

export const getOrCreateEconomy = (userId: EconomyUserId): EconomyRow => getEconomy(userId) ?? upsertEconomy(userId);
