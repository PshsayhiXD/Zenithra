import { getDatabase } from "@database/index";
import {
    DEFAULT_CHANNELS,
    GUILD_CHANNEL_TYPES,
    type GuildChannelId,
    type GuildChannelMessage,
    type GuildChannelType,
    type GuildChannels,
    type GuildId,
} from "@tables/types/guild";
import { deleteChannelsStmt, getChannelsStmt, setChannelStmt } from "@tables/guild/_statements";

const database = getDatabase();

export const getChannels = (guildId: GuildId): GuildChannels => {
  const rows = getChannelsStmt.all(guildId);
  const map: GuildChannels = { ...DEFAULT_CHANNELS };

  for (const row of rows) {
    const type = row.type;
    map[type] = Boolean(row.enabled);
    map[`${type}Channel`] = row.channelId ?? null;
    map[`${type}Message`] = row.message ?? null;
  }

  return map;
};

export const setChannel: (
  guildId: GuildId,
  type: GuildChannelType,
  enabled: boolean,
  channelId: GuildChannelId,
  message: GuildChannelMessage,
) => void = database.transaction(
  (
    guildId: GuildId,
    type: GuildChannelType,
    enabled: boolean,
    channelId: GuildChannelId,
    message: GuildChannelMessage,
  ): void => {
    setChannelStmt.run(
      guildId,
      type,
      enabled ? 1 : 0,
      channelId ?? null,
      message ?? null,
    );
  },
);

export const updateChannels: (guildId: GuildId, patch: Partial<GuildChannels>) => GuildChannels =
  database.transaction((guildId: GuildId, patch: Partial<GuildChannels>): GuildChannels => {
    const current = getChannels(guildId);

    for (const type of GUILD_CHANNEL_TYPES) {
      const enabled = patch[type] ?? current[type];
      const channelId = patch[`${type}Channel`] ?? current[`${type}Channel`];
      const message = patch[`${type}Message`] ?? current[`${type}Message`];

      setChannelStmt.run(
        guildId,
        type,
        enabled ? 1 : 0,
        channelId ?? null,
        message ?? null,
      );
    }

    return getChannels(guildId);
  });

export const resetChannels: (guildId: GuildId) => GuildChannels = database.transaction(
  (guildId: GuildId): GuildChannels => {
    deleteChannelsStmt.run(guildId);

    for (const type of GUILD_CHANNEL_TYPES) {
      setChannelStmt.run(
        guildId,
        type,
        DEFAULT_CHANNELS[type] ? 1 : 0,
        DEFAULT_CHANNELS[`${type}Channel`] ?? null,
        DEFAULT_CHANNELS[`${type}Message`] ?? null,
      );
    }

    return getChannels(guildId);
  },
);
