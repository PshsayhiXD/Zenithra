import type {
  EconomyCurrency,
  EconomyFeePercent,
  EconomyRow,
  EconomyUserId,
} from "@tables/types/economy/index.js";
import { updateBalancesStmt } from "@tables/economy/_statements.js";
import { getEconomy, getOrCreateEconomy } from "@tables/economy/userId.js";
import { CURRENCY } from "@configs/currency.js";
import { decimalToString, isFiniteDecimal, snapToBase } from "@utilities/currency.js";

const { BASE } = CURRENCY;

const assertPositiveAmount = (
  amount: EconomyCurrency,
  action: "Deposit" | "Withdraw",
): void => {
  if (!isFiniteDecimal(amount) || amount.lte(0)) {
    throw new Error(`${action} amount must be greater than 0.`);
  }
};

const assertFeePercent = (
  feePercent: EconomyFeePercent,
): void => {
  if (!isFiniteDecimal(feePercent) || feePercent.lt(0) || feePercent.gt(1)) {
    throw new Error("Fee percent must be between 0 and 1.");
  }
};

export const deposit = (
  userId: EconomyUserId,
  amount: EconomyCurrency,
  feePercent: EconomyFeePercent = CURRENCY.FEE_PERCENT,
): EconomyRow => {
  const normalized = snapToBase(amount);
  assertPositiveAmount(normalized, "Deposit");
  assertFeePercent(feePercent);
  const current = getOrCreateEconomy(userId);
  if (normalized.gt(current.currency)) throw new Error("Cannot deposit more than wallet balance.");
  const fee = normalized
    .mul(feePercent)
    .div(BASE)
    .floor()
    .mul(BASE);
  const net = normalized.sub(fee);
  const nextWallet = current.currency.minus(normalized);
  const nextBank = current.bank.plus(net);
  if (nextBank.gt(current.bankCapacity)) throw new Error("Cannot deposit beyond bank capacity.");
  const now = Date.now();
  updateBalancesStmt.run(
    decimalToString(nextWallet),
    decimalToString(nextBank),
    now,
    userId,
  );
  const row = getEconomy(userId);
  if (!row) throw new Error(`Failed to deposit for user: ${userId}`);
  return row;
};

export const withdraw = (
  userId: EconomyUserId,
  amount: EconomyCurrency,
): EconomyRow => {
  const normalized = snapToBase(amount);
  assertPositiveAmount(normalized, "Withdraw");
  const current = getOrCreateEconomy(userId);
  if (normalized.gt(current.bank)) throw new Error("Cannot withdraw more than bank balance.");
  const nextWallet = current.currency.plus(normalized);
  const nextBank = current.bank.minus(normalized);
  const now = Date.now();
  updateBalancesStmt.run(
    decimalToString(nextWallet),
    decimalToString(nextBank),
    now,
    userId,
  );
  const row = getEconomy(userId);
  if (!row) throw new Error(`Failed to withdraw for user: ${userId}`);
  return row;
};

export const getBank = (
  userId: EconomyUserId,
): EconomyRow => getOrCreateEconomy(userId);
