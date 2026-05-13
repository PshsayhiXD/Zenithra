import type { EconomyBank } from "@tables/types/economy/bank.js";
import type { EconomyBankCapacity } from "@tables/types/economy/bankCapacity.js";
import type { EconomyCurrency } from "@tables/types/economy/currency.js";
import type { EconomyUpdatedAt } from "@tables/types/economy/updatedAt.js";
import type { EconomyUserId } from "@tables/types/economy/userId.js";

export interface EconomyRow {
  userId: EconomyUserId;
  currency: EconomyCurrency;
  bank: EconomyBank;
  bankCapacity: EconomyBankCapacity;
  updatedAt: EconomyUpdatedAt;
}
