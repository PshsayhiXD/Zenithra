import type {
  EconomyCurrency,
  EconomyRow,
  EconomyUserId,
} from "@tables/types/economy";
import { updateWalletStmt } from "@tables/economy/_statements";
import { getEconomy, getOrCreateEconomy } from "@tables/economy/userId";

const assertFiniteAmount = (amount: EconomyCurrency): void => {
  if (!Number.isFinite(amount)) throw new TypeError("Amount must be a finite number.");
};

export const addWallet = (userId: EconomyUserId, amount: EconomyCurrency): EconomyRow => {
  assertFiniteAmount(amount);
  const now = Date.now();
  getOrCreateEconomy(userId);
  updateWalletStmt.run(amount, now, userId);
  const row = getEconomy(userId);
  if (!row) throw new Error(`Failed to update wallet for user: ${userId}`);
  return row;
};

export const getWallet = (userId: EconomyUserId): EconomyCurrency => getOrCreateEconomy(userId).currency;
export const getWalletRow = (userId: EconomyUserId): EconomyRow => getOrCreateEconomy(userId);
