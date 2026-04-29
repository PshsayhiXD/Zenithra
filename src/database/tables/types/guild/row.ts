import type { GuildChannels } from "@tables/types/guild/channels.js";
import type { GuildCreatedAt } from "@tables/types/guild/createdAt.js";
import type { GuildHashCache } from "@tables/types/guild/hashCache.js";
import type { GuildId } from "@tables/types/guild/id.js";
import type { GuildPrefix } from "@tables/types/guild/prefix.js";
import type { GuildUpdatedAt } from "@tables/types/guild/updatedAt.js";

export interface GuildRow {
  id: GuildId;
  prefix: GuildPrefix;
  hashCache: GuildHashCache;
  createdAt: GuildCreatedAt;
  updatedAt: GuildUpdatedAt;
}

export interface GuildSlashCommand {
  id: GuildId;
  hashCache: GuildHashCache;
}

export interface GuildData {
  id: GuildId;
  prefix: GuildPrefix;
  hashCache: GuildHashCache;
  channels: GuildChannels;
  createdAt: GuildCreatedAt;
  updatedAt: GuildUpdatedAt;
}

export interface GuildUpdate {
  prefix?: GuildPrefix;
  hashCache?: GuildHashCache;
  channels?: Partial<GuildChannels>;
}
