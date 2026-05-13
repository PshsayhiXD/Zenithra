export const GUILD_CHANNEL_TYPES = [
  "shipTracker",
  "eventTracker",
  "pvpEventTracker",
] as const;

export type GuildChannelType = (typeof GUILD_CHANNEL_TYPES)[number];
