import {
  PermissionsBitField,
  type GuildMember,
  type PermissionResolvable,
} from "discord.js";
import type { CommandPermission } from "@commands/types/command.js";

const toArray = <T>(v?: T | T[]): T[] =>
  // eslint-disable-next-line no-nested-ternary
  v === undefined ? [] : (Array.isArray(v) ? v : [v]);

export const formatCommandPermission = (permission?: CommandPermission): string => {
  if (permission === undefined) return "None";
  const discordPermissions = toArray(permission.discord);
  const roles = toArray(permission.roles);
  const discordLabels = discordPermissions.map((perm: PermissionResolvable) => {
    const matched = Object.entries(PermissionsBitField.Flags).find(([, value]) => value === perm);
    return matched === undefined ? String(perm) : matched[0];
  });
  const parts: string[] = [];
  if (discordLabels.length > 0) parts.push(`Discord: ${discordLabels.map((v: string) => `\`${v}\``).join(", ")}`);
  if (roles.length > 0) parts.push(`Roles: ${roles.map((v: string) => `\`${v}\``).join(", ")}`);
  const joined = parts.join("\n");
  return joined === "" ? "None" : joined;
};
export const hasCommandPermission = (
  member: GuildMember | null,
  permission?: CommandPermission,
  groupBypass?: boolean,
  isGroupDM?: boolean
): boolean => {
  if (isGroupDM === true && groupBypass === true) return true;
  if (permission === undefined) return true;
  if (member === null) return false;
  const discordPermissions = toArray(permission.discord);
  const roleChecks = toArray(permission.roles);
  const hasDiscordPermission =
    discordPermissions.length > 0 && member.permissions.has(discordPermissions);
  const hasRole =
    roleChecks.some(
      (role: string) =>
        member.roles.cache.has(role) ||
        member.roles.cache.some((r) => r.name === role),
    );
  if (discordPermissions.length > 0 && roleChecks.length > 0) return hasDiscordPermission || hasRole;
  if (discordPermissions.length > 0) return hasDiscordPermission;
  if (roleChecks.length > 0) return hasRole;
  return true;
};
export const getDefault = (module_: unknown): unknown => {
  if (module_ !== null && typeof module_ === "object") {
    const m1 = module_ as { default?: unknown };
    if (m1.default !== null && m1.default !== undefined && typeof m1.default === "object") {
      const m2 = m1.default as { default?: unknown };
      return m2.default ?? m1.default;
    }
    return m1.default ?? module_;
  }
  return module_;
};
