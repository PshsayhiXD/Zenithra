import type { UserId, UserRow } from "@tables/types/user";
import { getUserStmt } from "@tables/user/_statements";

const userCache = new Map<UserId, UserRow>();

export const getUser = (userId: UserId): UserRow | undefined => {
  const cached = userCache.get(userId);
  if (cached) return cached;

  const row = getUserStmt.get(userId) ?? undefined;
  if (row) userCache.set(userId, row);
  return row;
};

export const clearUserCache = (userId?: UserId): void => {
  if (userId === undefined) {userCache.clear();}
  else {userCache.delete(userId);}
};

export const setUserCache = (userId: UserId, row: UserRow): void => {
  userCache.set(userId, row);
};
