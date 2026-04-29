import { getDatabase } from "@database/index";
import type { UserCreatedAt, UserId, UserRow, UserUpdatedAt } from "@database/types/user";
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
