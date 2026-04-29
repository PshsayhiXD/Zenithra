import type { EconomyStreakRow, EconomyUserId } from "@tables/types/economy";
import { DAY } from "@utilities/time";
import { getStreakStmt, upsertStreakStmt } from "@tables/economy/_statements";
import { getOrCreateEconomy } from "@tables/economy/userId";

export const addStreak = (userId: EconomyUserId): EconomyStreakRow => {
  getOrCreateEconomy(userId);
  const row = getStreakStmt.get(userId);
  if (!row) throw new Error(`Failed to get streak for user: ${userId}`);
  const updated = { ...row, streak: row.streak + 1, updatedAt: Date.now() };
  upsertStreakStmt.run(userId, updated.streak, updated.updatedAt);
  return updated;
};

export const resetStreak = (userId: EconomyUserId): EconomyStreakRow => {
  const updated = { userId, streak: 0, updatedAt: Date.now() };
  upsertStreakStmt.run(userId, updated.streak, updated.updatedAt);
  return updated;
};

export const getStreak = (userId: EconomyUserId): EconomyStreakRow => {
  getOrCreateEconomy(userId);
  const row = getStreakStmt.get(userId);
  if (!row) throw new Error(`Failed to get streak for user: ${userId}`);
  return row;
};

export const isStreakExpired = (userId: EconomyUserId): boolean => {
  const row = getStreakStmt.get(userId);
  if (!row) throw new Error(`Failed to get streak for user: ${userId}`);
  return row.updatedAt < Date.now() - DAY;
};

export const checkStreak = (userId: EconomyUserId): EconomyStreakRow => {
  const row = getStreak(userId);
  if (isStreakExpired(userId)) return resetStreak(userId);
  return row;
};