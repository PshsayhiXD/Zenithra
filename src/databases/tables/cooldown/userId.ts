import type {
  CooldownNamespace,
  CooldownRow,
  CooldownUserId,
} from "@tables/types/cooldown/index.js";
import { deleteCooldownStmt, getCooldownStmt } from "@tables/cooldown/_statements.js";

export const getCooldown = (userId: CooldownUserId, namespace: CooldownNamespace): CooldownRow | undefined =>
  getCooldownStmt.get(userId, namespace) ?? undefined;

export const clearCooldown = (userId: CooldownUserId, namespace: CooldownNamespace): boolean => {
  const result = deleteCooldownStmt.run(userId, namespace);
  return result.changes > 0;
};
