import {
  deleteGlobalSlashCommand,
  deleteGuildSlashCommand,
  getAllGuildSlashCommands,
  getGlobalSlashCommand,
  setGlobalSlashCommand,
  setGuildSlashCommand,
} from "@tables/index.js";

import type { GuildSlashCommand } from "@tables/types/guild/index.js";
import type { SlashCommandHashCache } from "@commands/types/slashCommandHashCache.js";

export const readSlashCommandHashCache = (): SlashCommandHashCache => {
  const global = getGlobalSlashCommand();
  const guildRows: GuildSlashCommand[] = getAllGuildSlashCommands();
  return {
    ...(global ? { global: global.hashCache } : {}),
    guilds: Object.fromEntries(guildRows.map((row: GuildSlashCommand): [string, string] => [row.id, row.hashCache])),
  };
};

export const writeSlashCommandHashCache = (cache: SlashCommandHashCache): void => {
  if (cache.global !== undefined && cache.global !== "") setGlobalSlashCommand(cache.global);
  else deleteGlobalSlashCommand();
  const currentGuilds = getAllGuildSlashCommands();
  for (const row of currentGuilds) {
    if (!(row.id in (cache.guilds ?? {}))) deleteGuildSlashCommand(row.id);
  }
  for (const [guildId, hashCache] of Object.entries(cache.guilds ?? {})) setGuildSlashCommand(guildId, hashCache);
};
