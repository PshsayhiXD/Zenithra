import { User as UserTable } from "@tables/index.js";
import { USERNAME as USERNAME_CONFIG } from "@configs/username.js";
import type { UsernameValidationResult } from "@Rmigrations/logic/001/types.js";
import { RESERVED_USERNAMES } from "@Rmigrations/logic/001/constants.js";

export const normalizeUsername = (value: string): string =>
  value.trim().toLowerCase();

export const isReservedUsername = (username: string): boolean =>
  RESERVED_USERNAMES.has(username);

export const validateUsername = (
  value: string,
  discordId: string,
): UsernameValidationResult => {
  const username = normalizeUsername(value);

  if (username.length < USERNAME_CONFIG.MIN_LENGTH || username.length > USERNAME_CONFIG.MAX_LENGTH) {
    return {
      ok: false,
      error: `Username must be ${String(USERNAME_CONFIG.MIN_LENGTH)}-${String(USERNAME_CONFIG.MAX_LENGTH)} characters.`,
    };
  }

  if (!USERNAME_CONFIG.PATTERN.test(username)) {
    return {
      ok: false,
      error: "Username must use only letters, numbers, and underscores, spaces are allowed but not multiple spaces and no leading/trailing spaces.",
    };
  }

  if (isReservedUsername(username)) {
    return {
      ok: false,
      error: "That username is reserved.",
    };
  }

  const existingUser = UserTable.getUserByUsername(username);

  if (existingUser !== undefined && existingUser.id !== discordId) {
    return {
      ok: false,
      error: "That username is already taken.",
    };
  }

  return {
    ok: true,
    username,
  };
};
