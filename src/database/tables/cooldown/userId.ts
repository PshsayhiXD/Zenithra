import type {
  CooldownCommand,
  CooldownRow,
  CooldownUserId,
} from "@tables/types/cooldown";
import { deleteCooldownStmt, getCooldownStmt } from "@tables/cooldown/_statements";

export const getCooldown = (userId: CooldownUserId, command: CooldownCommand): CooldownRow | undefined => getCooldownStmt.get(userId, command) ?? undefined;

export const clearCooldown = (userId: CooldownUserId, command: CooldownCommand): boolean => {
  const result = deleteCooldownStmt.run(userId, command);
  return result.changes > 0;
};
