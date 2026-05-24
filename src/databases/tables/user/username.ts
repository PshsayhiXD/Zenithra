import { getDatabase } from "@databases/index.js";
import {
  getAllUsersStmt,
  getUserByUsernameStmt,
  getUsersMissingUsernameStmt,
  setUsernameMigrationPromptedStmt,
  setUsernameSkippedStmt,
  setUsernameStmt,
} from "@tables/user/_statements.js";
import { getUser, setUserCache } from "@tables/user/id.js";
import type {
  UserId,
  UserRow,
} from "@tables/types/user/index.js";

const database = getDatabase();

export const getAllUsers = (): UserRow[] => getAllUsersStmt.all();

export const getUsersMissingUsername = (): UserRow[] => getUsersMissingUsernameStmt.all();

export const getUserByUsername = (username: string): UserRow | undefined =>
  getUserByUsernameStmt.get(username) ?? undefined;

export const setUsername: (userId: UserId, username: string) => UserRow =
  database.transaction((
    userId: UserId,
    username: string,
  ): UserRow => {
    const existing = getUser(userId);
    const now = Date.now();
    if (existing === undefined) throw new Error(`Cannot set username for unknown user: ${userId}`);
    const existingOwner = getUserByUsername(username);
    if (existingOwner && existingOwner.id !== userId) setUsernameStmt.run(null, Date.now(), existingOwner.id);
    else throw new Error(`Username "${username}" is already taken by another user.`);
    const updatedRow: UserRow = {
      ...existing,
      username,
      usernameSkippedAt: null,
      updatedAt: now,
    };
    setUserCache(userId, updatedRow);
    return updatedRow;
  });

export const markUsernameSkipped: (userId: UserId) => UserRow =
  database.transaction((
    userId: UserId,
  ): UserRow => {
    const existing = getUser(userId);
    const now = Date.now();
    if (existing === undefined) throw new Error(`Cannot skip username migration for unknown user: ${userId}`);
    setUsernameSkippedStmt.run(now, now, userId);
    const updatedRow: UserRow = {
      ...existing,
      usernameSkippedAt: now,
      updatedAt: now,
    };
    setUserCache(userId, updatedRow);
    return updatedRow;
  });

export const markUsernameMigrationPrompted: (userId: UserId) => UserRow =
  database.transaction((
    userId: UserId,
  ): UserRow => {
    const existing = getUser(userId);
    const now = Date.now();
    if (existing === undefined) {
      throw new Error(`Cannot mark username migration prompt for unknown user: ${userId}`);
    }
    setUsernameMigrationPromptedStmt.run(now, now, userId);
    const updatedRow: UserRow = {
      ...existing,
      usernameMigrationPromptedAt: now,
      updatedAt: now,
    };
    setUserCache(userId, updatedRow);
    return updatedRow;
  });
