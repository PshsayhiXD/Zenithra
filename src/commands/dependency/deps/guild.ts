import {
  GUILD_CHANNEL_TYPES,
  type GuildChannelType,
} from "@tables/types/guild/index.js";

export const isGuildChannelType = (v: string): v is GuildChannelType => (GUILD_CHANNEL_TYPES as readonly string[]).includes(v);
