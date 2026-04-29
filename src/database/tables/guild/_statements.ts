import { getDatabase } from "@database/index.js";
import type {
    GuildChannelEnabled,
    GuildChannelId,
    GuildChannelMessage,
    GuildChannelRow,
    GuildChannelType,
    GuildCreatedAt,
    GuildHashCache,
    GuildId,
    GuildPrefix,
    GuildRow,
    GuildSlashCommand,
    GuildUpdatedAt,
} from "@tables/types/guild/index.js";
import type { Statement } from "better-sqlite3";

const database = getDatabase();

export const getGuildStmt: Statement<[GuildId], GuildRow> = database.prepare(
  "SELECT * FROM guilds WHERE id = ?",
);

export const upsertGuildStmt: Statement<[GuildId, GuildPrefix, GuildCreatedAt, GuildUpdatedAt]> =
  database.prepare(`
  INSERT INTO guilds (id, prefix, createdAt, updatedAt)
  VALUES (?, ?, ?, ?)
  ON CONFLICT (id) DO UPDATE SET updatedAt = excluded.updatedAt
`);

export const setPrefixStmt: Statement<[GuildPrefix, GuildUpdatedAt, GuildId]> = database.prepare(
  "UPDATE guilds SET prefix = ?, updatedAt = ? WHERE id = ?",
);

export const getChannelsStmt: Statement<[GuildId], GuildChannelRow> = database.prepare(
  "SELECT * FROM guild_channels WHERE guildId = ?",
);

export const setChannelStmt: Statement<
  [GuildId, GuildChannelType, GuildChannelEnabled, GuildChannelId, GuildChannelMessage]
> = database.prepare(`
  INSERT INTO guild_channels (guildId, type, enabled, channelId, message)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(guildId, type) DO UPDATE SET
    enabled = excluded.enabled,
    channelId = excluded.channelId,
    message = excluded.message
`);

export const deleteChannelsStmt: Statement<[GuildId]> = database.prepare(
  "DELETE FROM guild_channels WHERE guildId = ?",
);

export const getGuildSlashCommandStmt: Statement<[GuildId], GuildSlashCommand> = database.prepare(
  "SELECT id, hashCache FROM guilds WHERE id = ?",
);

export const setGuildSlashCommandStmt: Statement<[GuildHashCache, GuildUpdatedAt, GuildId]> =
  database.prepare("UPDATE guilds SET hashCache = ?, updatedAt = ? WHERE id = ?");

export const deleteGuildSlashCommandStmt: Statement<[GuildUpdatedAt, GuildId]> = database.prepare(
  "UPDATE guilds SET hashCache = '', updatedAt = ? WHERE id = ?",
);

export const getAllGuildSlashCommandsStmt: Statement<[], GuildSlashCommand> = database.prepare(
  "SELECT id, hashCache FROM guilds",
);
