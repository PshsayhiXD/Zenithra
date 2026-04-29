import type { CooldownCommand } from "@tables/types/cooldown/command";
import type { CooldownExpiresAt } from "@tables/types/cooldown/expiresAt";
import type { CooldownUserId } from "@tables/types/cooldown/userId";

export interface CooldownRow {
  userId: CooldownUserId;
  command: CooldownCommand;
  expiresAt: CooldownExpiresAt;
}
