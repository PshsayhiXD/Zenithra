import type {
  EconomyCurrency,
  EconomyFeePercent,
  EconomyRow,
  EconomyUserId,
} from "@tables/types/economy/index.js";
import { updateBalancesStmt } from "@tables/economy/_statements.js";
import { getEconomy, getOrCreateEconomy } from "@tables/economy/userId.js";
import { CURRENCY } from "@configs/currency.js";
import { Decimal } from "decimal.js";

const assertPositiveAmount = (amount: EconomyCurrency, action: "Deposit" | "Withdraw"): void => {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(`${action} amount must be greater than 0.`);
};

const assertFeePercent = (feePercent: EconomyFeePercent): void => {
  if (!Number.isFinite(feePercent) || feePercent < 0 || feePercent > 1) throw new Error("Fee percent must be between 0 and 1.");
};

export const deposit = (userId: EconomyUserId, amount: EconomyCurrency, feePercent: EconomyFeePercent = CURRENCY.FEE_PERCENT): EconomyRow => {
  assertPositiveAmount(amount, "Deposit");
  assertFeePercent(feePercent);
  const current = getOrCreateEconomy(userId);
  if (amount > current.currency) throw new Error("Cannot deposit more than wallet balance.");
  const BASE = new Decimal("1e-16");
  const fee = new Decimal(amount).mul(feePercent).div(BASE).floor().mul(BASE).toNumber();
  const net = new Decimal(amount).sub(fee).toNumber();
  if (new Decimal(current.bank).plus(net).gt(current.bankCapacity)) throw new Error("Cannot deposit beyond bank capacity.");
  const now = Date.now();
  updateBalancesStmt.run(-amount, net, now, userId);
  const row = getEconomy(userId);
  if (!row) throw new Error(`Failed to deposit for user: ${userId}`);
  return row;
};

export const withdraw = (userId: EconomyUserId, amount: EconomyCurrency): EconomyRow => {
  assertPositiveAmount(amount, "Withdraw");
  const current = getOrCreateEconomy(userId);
  if (amount > current.bank) throw new Error("Cannot withdraw more than bank balance.");
  const now = Date.now();
  updateBalancesStmt.run(amount, -amount, now, userId);
  const row = getEconomy(userId);
  if (!row) throw new Error(`Failed to withdraw for user: ${userId}`);
  return row;
};

export const getBank = (userId: EconomyUserId): EconomyRow => getOrCreateEconomy(userId);
