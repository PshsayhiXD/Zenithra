import type { EconomyUpdatedAt, EconomyUserId } from "@tables/types/economy/index.js";

export interface EconomyStreakRow {
  userId: EconomyUserId;
  streak: EconomyStreak;
  updatedAt: EconomyUpdatedAt;
}

export type EconomyStreak = number;
