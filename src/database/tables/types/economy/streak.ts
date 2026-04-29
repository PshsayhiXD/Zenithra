import type { EconomyUpdatedAt, EconomyUserId } from "@tables/types/economy";

export interface EconomyStreakRow {
  userId: EconomyUserId;
  streak: EconomyStreak;
  updatedAt: EconomyUpdatedAt;
}

export type EconomyStreak = number;