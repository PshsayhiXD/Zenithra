import type { MigrationDefinition } from "@Rmigrations/shared/types.js";
import { addUserNameMigration } from "@Rmigrations/index/001_add_user_name.js";

export const migrationDefinitions: MigrationDefinition[] = [
  addUserNameMigration,
];
