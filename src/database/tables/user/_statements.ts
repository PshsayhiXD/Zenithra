import { getDatabase } from "@database/index.js";
import type { UserCreatedAt, UserId, UserRow, UserUpdatedAt } from "@tables/types/user/index.js";
import type { Statement } from "better-sqlite3";

const database = getDatabase();

export const getUserStmt: Statement<[UserId], UserRow> = database.prepare(
  "SELECT * FROM users WHERE id = ?",
);

export const upsertUserStmt: Statement<[UserId, UserCreatedAt, UserUpdatedAt]> = database.prepare(`
  INSERT INTO users (id, createdAt, updatedAt)
  VALUES (?, ?, ?)
  ON CONFLICT (id) DO UPDATE SET updatedAt = excluded.updatedAt
`);
