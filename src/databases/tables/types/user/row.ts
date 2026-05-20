import type { UserCreatedAt } from "@tables/types/user/createdAt.js";
import type { UserId } from "@tables/types/user/id.js";
import type { UserUpdatedAt } from "@tables/types/user/updatedAt.js";
import type { UserUsername } from "@tables/types/user/username.js";
import type { UserUsernameSkippedAt } from "@tables/types/user/usernameSkippedAt.js";
import type { UserUsernameMigrationPromptedAt } from "@tables/types/user/usernameMigrationPromptedAt.js";

export interface UserRow {
  id: UserId;
  username: UserUsername;
  usernameSkippedAt: UserUsernameSkippedAt;
  usernameMigrationPromptedAt: UserUsernameMigrationPromptedAt;
  createdAt: UserCreatedAt;
  updatedAt: UserUpdatedAt;
}
