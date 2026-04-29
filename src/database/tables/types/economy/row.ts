import type { EconomyBank } from "@tables/types/economy/bank";
import type { EconomyBankCapacity } from "@tables/types/economy/bankCapacity";
import type { EconomyCurrency } from "@tables/types/economy/currency";
import type { EconomyUpdatedAt } from "@tables/types/economy/updatedAt";
import type { EconomyUserId } from "@tables/types/economy/userId";

export interface EconomyRow {
  userId: EconomyUserId;
  currency: EconomyCurrency;
  bank: EconomyBank;
  bankCapacity: EconomyBankCapacity;
  updatedAt: EconomyUpdatedAt;
}
