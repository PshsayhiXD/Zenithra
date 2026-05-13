import type { CooldownCommand } from "@tables/types/cooldown/command.js";
import type { CooldownExpiresAt } from "@tables/types/cooldown/expiresAt.js";
import type { CooldownUserId } from "@tables/types/cooldown/userId.js";

export interface CooldownRow {
  userId: CooldownUserId;
  command: CooldownCommand;
  expiresAt: CooldownExpiresAt;
}
