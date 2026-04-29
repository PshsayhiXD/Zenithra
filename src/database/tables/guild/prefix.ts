import { getDatabase } from "@database/index";
import type { GuildId, GuildPrefix } from "@tables/types/guild";
import { setPrefixStmt } from "@tables/guild/_statements";
import { clearGuildCache, getOrCreateGuild, upsertGuild } from "@tables/guild/id";

const database = getDatabase();

export const getPrefix = (guildId: GuildId): GuildPrefix => getOrCreateGuild(guildId).prefix;

export const setPrefix: (guildId: GuildId, prefix: GuildPrefix) => GuildPrefix =
  database.transaction((guildId: GuildId, prefix: GuildPrefix): GuildPrefix => {
    const next = prefix.trim();
    if (!next || next.length > 10) throw new Error("Invalid prefix.");

    const now = Date.now();
    upsertGuild(guildId);
    setPrefixStmt.run(next, now, guildId);
    clearGuildCache(guildId);
    return next;
  });
