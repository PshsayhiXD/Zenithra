import type { GuildId } from "@tables/types/guild/id";
import type { GuildChannelEnabled } from "@tables/types/guild/channelEnabled";
import type { GuildChannelId } from "@tables/types/guild/channelId";
import type { GuildChannelMessage } from "@tables/types/guild/channelMessage";
import type { GuildChannelType } from "@tables/types/guild/channelType";

export type GuildChannels = Record<GuildChannelType, boolean> & Record<`${GuildChannelType}Channel`, GuildChannelId> & Record<`${GuildChannelType}Message`, GuildChannelMessage>;

export interface GuildChannelRow {
  guildId: GuildId;
  type: GuildChannelType;
  enabled: GuildChannelEnabled;
  channelId: GuildChannelId;
  message: GuildChannelMessage;
}

export const DEFAULT_CHANNELS: GuildChannels = Object.fromEntries([
  ...(["shipTracker", "eventTracker", "pvpEventTracker"] as const).map((k) => [k, false]),
  ...(["shipTracker", "eventTracker", "pvpEventTracker"] as const).map((k) => [`${k}Channel`, ""]),
  ...(["shipTracker", "eventTracker", "pvpEventTracker"] as const).map((k) => [`${k}Message`, ""]),
]) as GuildChannels;
