import { getDatabase } from "@database/index";
import type { GuildHashCache, GuildId, GuildSlashCommand } from "@tables/types/guild";
import {
  deleteGuildSlashCommandStmt,
  getAllGuildSlashCommandsStmt,
  getGuildSlashCommandStmt,
  setGuildSlashCommandStmt,
} from "@tables/guild/_statements";
import { upsertGuild } from "@tables/guild/id";

const database = getDatabase();

export const getGuildSlashCommand = (guildId: GuildId): GuildSlashCommand | undefined => getGuildSlashCommandStmt.get(guildId) ?? undefined;

export const setGuildSlashCommand: (guildId: GuildId, hashCache: GuildHashCache) => void =
  database.transaction((guildId: GuildId, hashCache: GuildHashCache): void => {
    const now = Date.now();
    upsertGuild(guildId);
    setGuildSlashCommandStmt.run(hashCache, now, guildId);
  });

export const deleteGuildSlashCommand: (guildId: GuildId) => void = database.transaction(
  (guildId: GuildId): void => {
    const now = Date.now();
    upsertGuild(guildId);
    deleteGuildSlashCommandStmt.run(now, guildId);
  },
);

export const getAllGuildSlashCommands = (): GuildSlashCommand[] => getAllGuildSlashCommandsStmt.all();
