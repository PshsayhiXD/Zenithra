import {
    DEFAULT_PREFIX,
    type GuildId,
    type GuildRow,
} from "@tables/types/guild/index.js";
import { getGuildStmt, upsertGuildStmt } from "@tables/guild/_statements.js";

const guildCache = new Map<GuildId, GuildRow>();

export const upsertGuild = (guildId: GuildId): GuildRow => {
  const cached = guildCache.get(guildId);
  if (cached) return cached;
  const now = Date.now();
  upsertGuildStmt.run(guildId, DEFAULT_PREFIX, now, now);
  const row = getGuildStmt.get(guildId);
  if (!row) throw new Error(`Failed to upsert guild: ${guildId}`);
  guildCache.set(guildId, row);
  return row;
};

export const getGuild = (guildId: GuildId): GuildRow | undefined => {
  const cached = guildCache.get(guildId);
  if (cached) return cached;
  const row = getGuildStmt.get(guildId) ?? undefined;
  if (row) guildCache.set(guildId, row);
  return row;
};

export const clearGuildCache = (guildId?: GuildId): void => {
  if (guildId === undefined) {guildCache.clear();}
  else {guildCache.delete(guildId);}
};

export const getOrCreateGuild = (guildId: GuildId): GuildRow => getGuild(guildId) ?? upsertGuild(guildId);
