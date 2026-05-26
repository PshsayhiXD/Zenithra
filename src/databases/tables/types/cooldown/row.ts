import type { CooldownNamespace } from "@/databases/tables/types/cooldown/namespace.js";
import type { CooldownExpiresAt } from "@tables/types/cooldown/expiresAt.js";
import type { CooldownUserId } from "@tables/types/cooldown/userId.js";

export interface CooldownRow {
  userId: CooldownUserId;
  namespace: CooldownNamespace;
  expiresAt: CooldownExpiresAt;
}
