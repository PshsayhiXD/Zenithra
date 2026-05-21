import type {
  EconomyCurrency,
  EconomyFeePercent,
  EconomyRow,
  EconomyUserId,
} from "@tables/types/economy/index.js";
import { updateBalancesStmt } from "@tables/economy/_statements.js";
import { getEconomy, getOrCreateEconomy } from "@tables/economy/userId.js";
import { CURRENCY } from "@configs/currency.js";
import { normalizeAmount } from "@utilities/currency.js";
import { Decimal } from "decimal.js";

const { BASE } = CURRENCY;

const assertPositiveAmount = (
  amount: EconomyCurrency,
  action: "Deposit" | "Withdraw",
): void => {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(`${action} amount must be greater than 0.`);
};

const assertFeePercent = (
  feePercent: EconomyFeePercent,
): void => {
  if (
    !Number.isFinite(feePercent) ||
    feePercent < 0 ||
    feePercent > 1
  ) throw new Error("Fee percent must be between 0 and 1.");
};

export const deposit = (
  userId: EconomyUserId,
  amount: EconomyCurrency,
  feePercent: EconomyFeePercent = CURRENCY.FEE_PERCENT,
): EconomyRow => {
  const normalized = normalizeAmount(amount);
  assertPositiveAmount(normalized, "Deposit");
  assertFeePercent(feePercent);
  const current = getOrCreateEconomy(userId);
  if (normalized > current.currency) throw new Error("Cannot deposit more than wallet balance.");
  const fee = new Decimal(normalized)
    .mul(feePercent)
    .div(BASE)
    .floor()
    .mul(BASE)
    .toNumber();
  const net = new Decimal(normalized)
    .sub(fee)
    .toNumber();
  if (
    new Decimal(current.bank)
      .plus(net)
      .gt(current.bankCapacity)
  ) throw new Error("Cannot deposit beyond bank capacity.");
  const now = Date.now();
  updateBalancesStmt.run(
    -normalized,
    net,
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
  const normalized = normalizeAmount(amount);
  assertPositiveAmount(normalized, "Withdraw");
  const current = getOrCreateEconomy(userId);
  if (normalized > current.bank) throw new Error("Cannot withdraw more than bank balance.");
  const now = Date.now();
  updateBalancesStmt.run(
    normalized,
    -normalized,
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
