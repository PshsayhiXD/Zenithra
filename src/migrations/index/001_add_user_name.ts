/* eslint-disable unicorn/filename-case */
import type { MigrationDefinition } from "@Rmigrations/shared/types.js";
import { addUsernames } from "@Rmigrations/logic/001/run.js";
import { registerUsernameMigrationHandlers } from "@Rmigrations/logic/001/registerHandlers.js";

export const addUserNameMigration: MigrationDefinition = {
  id: "001_add_user_name",
  registerHandlers: registerUsernameMigrationHandlers,
  run: addUsernames,
};
