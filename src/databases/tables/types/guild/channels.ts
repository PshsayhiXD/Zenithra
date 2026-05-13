import type { GuildId } from "@tables/types/guild/id.js";
import type { GuildChannelEnabled } from "@tables/types/guild/channelEnabled.js";
import type { GuildChannelId } from "@tables/types/guild/channelId.js";
import type { GuildChannelMessage } from "@tables/types/guild/channelMessage.js";

export const TRACKERS = [
  "shipTracker",
  "eventTracker",
  "pvpEventTracker",
] as const;

export type TrackerKey = (typeof TRACKERS)[number];

export type GuildChannels = Record<TrackerKey, boolean> & Record<`${TrackerKey}Channel`, GuildChannelId> & Record<`${TrackerKey}Message`, GuildChannelMessage>;

export interface GuildChannelRow {
  guildId: GuildId;
  type: TrackerKey;
  enabled: GuildChannelEnabled;
  channelId: GuildChannelId;
  message: GuildChannelMessage;
}

const createDefaults = (): GuildChannels => Object.fromEntries(
    TRACKERS.flatMap((k) => [
      [k, false],
      [`${k}Channel`, ""],
      [`${k}Message`, ""],
    ]),
  ) as GuildChannels;

export const DEFAULT_CHANNELS = createDefaults();

export const isTrackerKey = (value: string): value is TrackerKey =>
  (TRACKERS as readonly string[]).includes(value);
