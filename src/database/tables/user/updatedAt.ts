import type {
  UserId,
  UserRow,
} from "@tables/types/user";
import { upsertUserStmt } from "@tables/user/_statements";
import { getUser, setUserCache } from "@tables/user/id";

export const upsertUser = (userId: UserId): UserRow => {
  const cached = getUser(userId);
  const now = Date.now();
  if (cached && (now - cached.updatedAt) < 60_000) return cached;
  const nowCreatedAt = now;
  const nowUpdatedAt = now;
  upsertUserStmt.run(userId, nowCreatedAt, nowUpdatedAt);
  const row = getUser(userId);
  if (!row) throw new Error(`Failed to upsert user: ${userId}`);
  setUserCache(userId, row);
  return row;
};

export const getOrCreateUser = (userId: UserId): UserRow => getUser(userId) ?? upsertUser(userId);
