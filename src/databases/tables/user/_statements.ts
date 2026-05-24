import { getDatabase } from "@databases/index.js";
import type {
  UserCreatedAt,
  UserId,
  UserRow,
  UserUpdatedAt,
  UserUsername,
  UserUsernameMigrationPromptedAt,
  UserUsernameSkippedAt,
} from "@tables/types/user/index.js";
import type { Statement } from "better-sqlite3";

const database = getDatabase();

export const getUserStmt: Statement<[UserId], UserRow> = database.prepare(
  "SELECT * FROM users WHERE id = ? LIMIT 1",
);

export const getAllUsersStmt: Statement<[], UserRow> = database.prepare(
  "SELECT * FROM users ORDER BY createdAt ASC",
);

export const getUsersMissingUsernameStmt: Statement<[], UserRow> = database.prepare(`
  SELECT *
  FROM users
  WHERE username IS NULL
    AND usernameSkippedAt IS NULL
    AND usernameMigrationPromptedAt IS NULL
  ORDER BY createdAt ASC
`);

export const getUserByUsernameStmt: Statement<[string], UserRow> = database.prepare(
  "SELECT * FROM users WHERE username = ? LIMIT 1",
);

export const upsertUserStmt: Statement<[UserId, UserCreatedAt, UserUpdatedAt]> = database.prepare(`
  INSERT INTO users (id, username, usernameSkippedAt, usernameMigrationPromptedAt, createdAt, updatedAt)
  VALUES (?, NULL, NULL, NULL, ?, ?)
  ON CONFLICT (id) DO UPDATE SET updatedAt = excluded.updatedAt
`);

export const setUsernameStmt: Statement<[UserUsername, UserUpdatedAt, UserId]> = database.prepare(`
  UPDATE users
  SET username = ?,
      usernameSkippedAt = NULL,
      updatedAt = ?
  WHERE id = ?
`);

export const setUsernameSkippedStmt: Statement<[UserUsernameSkippedAt, UserUpdatedAt, UserId]> = database.prepare(`
  UPDATE users
  SET usernameSkippedAt = ?,
      updatedAt = ?
  WHERE id = ?
`);

export const setUsernameMigrationPromptedStmt: Statement<[UserUsernameMigrationPromptedAt, UserUpdatedAt, UserId]> = database.prepare(`
  UPDATE users
  SET usernameMigrationPromptedAt = ?,
      updatedAt = ?
  WHERE id = ?
`);
