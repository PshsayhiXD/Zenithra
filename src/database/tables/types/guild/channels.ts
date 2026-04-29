import type { GuildId } from "@tables/types/guild/id.js";
import type { GuildChannelEnabled } from "@tables/types/guild/channelEnabled.js";
import type { GuildChannelId } from "@tables/types/guild/channelId.js";
import type { GuildChannelMessage } from "@tables/types/guild/channelMessage.js";
import type { GuildChannelType } from "@tables/types/guild/channelType.js";

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
