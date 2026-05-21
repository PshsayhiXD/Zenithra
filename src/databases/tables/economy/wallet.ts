import type {
  EconomyCurrency,
  EconomyRow,
  EconomyUserId,
} from "@tables/types/economy/index.js";
import { updateWalletStmt } from "@tables/economy/_statements.js";
import { getEconomy, getOrCreateEconomy } from "@tables/economy/userId.js";
import { normalizeAmount } from "@utilities/currency.js";

const assertFiniteAmount = (
  amount: EconomyCurrency,
): void => {
  if (!Number.isFinite(amount)) throw new TypeError("Amount must be a finite number.");
};

export const addWallet = (
  userId: EconomyUserId,
  amount: EconomyCurrency,
): EconomyRow => {
  const normalized = normalizeAmount(amount);
  assertFiniteAmount(normalized);
  if (normalized === 0) throw new Error("Amount must not normalize to 0.");
  getOrCreateEconomy(userId);
  const now = Date.now();
  updateWalletStmt.run(
    normalized,
    now,
    userId,
  );
  const row = getEconomy(userId);
  if (!row) throw new Error(`Failed to update wallet for user: ${userId}`);
  return row;
};

export const getWallet = (
  userId: EconomyUserId,
): EconomyCurrency => getOrCreateEconomy(userId).currency;

export const getWalletRow = (
  userId: EconomyUserId,
): EconomyRow => getOrCreateEconomy(userId);
