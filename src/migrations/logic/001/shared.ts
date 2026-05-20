import { User as UserTable } from "@tables/index.js";

export const userNeedsUsername = (discordId: string): boolean => {
  const user = UserTable.getUser(discordId);
  return user?.username === null;
};
