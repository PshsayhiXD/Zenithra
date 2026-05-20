export const USERNAME_MIGRATION_NAMESPACE = "username-migration";
export const USERNAME_SKIP_HANDLER_KEY = `${USERNAME_MIGRATION_NAMESPACE}:skip`;
export const USERNAME_CHANGE_HANDLER_KEY = `${USERNAME_MIGRATION_NAMESPACE}:change`;
export const USERNAME_SUBMIT_HANDLER_KEY = `${USERNAME_MIGRATION_NAMESPACE}:submit`;
export const USERNAME_MODAL_FIELD_ID = "username";
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const RESERVED_USERNAMES = new Set<string>([
  "admin",
  "administrator",
  "api",
  "bot",
  "discord",
  "everyone",
  "here",
  "mod",
  "moderator",
  "null",
  "owner",
  "root",
  "staff",
  "support",
  "system",
]);
