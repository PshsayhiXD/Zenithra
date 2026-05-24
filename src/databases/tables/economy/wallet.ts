import type {
  EconomyCurrency,
  EconomyRow,
  EconomyUserId,
} from "@tables/types/economy/index.js";
import { updateWalletStmt } from "@tables/economy/_statements.js";
import { getEconomy, getOrCreateEconomy } from "@tables/economy/userId.js";
import { decimalToString, isFiniteDecimal, snapToBase } from "@utilities/currency.js";

const assertFiniteAmount = (
  amount: EconomyCurrency,
): void => {
  if (!isFiniteDecimal(amount)) throw new TypeError("Amount must be a finite Decimal.");
};

export const addWallet = (
  userId: EconomyUserId,
  amount: EconomyCurrency,
): EconomyRow => {
  const normalized = snapToBase(amount);
  assertFiniteAmount(normalized);
  if (normalized.eq(0)) throw new Error("Amount must not normalize to 0.");
  const current = getOrCreateEconomy(userId);
  const nextWallet = current.currency.plus(normalized);
  const now = Date.now();
  updateWalletStmt.run(
    decimalToString(nextWallet),
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
