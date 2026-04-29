import {
  deleteGlobalSlashCommand,
  deleteGuildSlashCommand,
  getAllGuildSlashCommands,
  getGlobalSlashCommand,
  setGlobalSlashCommand,
  setGuildSlashCommand,
} from "@tables/index";

import type { GuildSlashCommand } from "@tables/types/guild/index";
import type { SlashCommandHashCache } from "@command/types/slashCommandHashCache";

export const readSlashCommandHashCache = (): SlashCommandHashCache => {
  const global = getGlobalSlashCommand();
  const guildRows: GuildSlashCommand[] = getAllGuildSlashCommands();
  return {
    ...(global ? { global: global.hashCache } : {}),
    guilds: Object.fromEntries(guildRows.map((row: GuildSlashCommand): [string, string] => [row.id, row.hashCache])),
  };
};

export const writeSlashCommandHashCache = (cache: SlashCommandHashCache): void => {
  deleteGlobalSlashCommand();
  const currentGuilds: GuildSlashCommand[] = getAllGuildSlashCommands();
  for (const row of currentGuilds) {
    deleteGuildSlashCommand(row.id);
  }
  if (cache.global !== undefined && cache.global !== "") setGlobalSlashCommand(cache.global);
  const entries = Object.entries(cache.guilds ?? {});
  for (const [guildId, hashCache] of entries) {
    setGuildSlashCommand(guildId, hashCache);
  }
};
