import type { User } from "@Rmigrations/logic/001/types.js";
import { User as UserTable } from "@tables/index.js";

export const toMigrationUser = (discordId: string, username: string | null): User => ({
  discordId,
  username,
});

export const hasCompletedUsernameMigration = (discordId: string): boolean => {
  const user = UserTable.getUser(discordId);
  return user?.username !== null && user?.username !== undefined;
};
