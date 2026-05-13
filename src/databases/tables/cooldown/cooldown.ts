import type {
  CooldownCommand,
  CooldownDurationMs,
  CooldownExpiresAt,
  CooldownPrunedCount,
  CooldownUserId,
} from "@tables/types/cooldown/index.js";
import { clearCooldown, getCooldown } from "@tables/cooldown/userId.js";
import { pruneExpiredStmt, setCooldownStmt } from "@tables/cooldown/_statements.js";

export const getRemainingCooldown = (userId: CooldownUserId, command: CooldownCommand): CooldownDurationMs => {
  const row = getCooldown(userId, command);
  if (!row) return 0;
  const remaining: CooldownDurationMs = row.expiresAt - Date.now();
  if (remaining <= 0) {
    clearCooldown(userId, command);
    return 0;
  }
  return remaining;
};

export const hasCooldown = (userId: CooldownUserId, command: CooldownCommand): boolean => getRemainingCooldown(userId, command) > 0;

export const setCooldown = (userId: CooldownUserId, command: CooldownCommand, durationMs: CooldownDurationMs): CooldownExpiresAt => {
  if (!Number.isFinite(durationMs) || durationMs <= 0) throw new Error("Cooldown duration must be greater than 0.");
  const expiresAt: CooldownExpiresAt = Date.now() + Math.floor(durationMs);
  setCooldownStmt.run(userId, command, expiresAt);
  return expiresAt;
};

export const pruneExpiredCooldowns = (): CooldownPrunedCount => {
  const result = pruneExpiredStmt.run(Date.now());
  return result.changes;
};
