CREATE TABLE IF NOT EXISTS guild_channels (
  guildId TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled INTEGER NOT NULL,
  channelId TEXT,
  message TEXT,
  PRIMARY KEY (guildId, type)
);

CREATE INDEX IF NOT EXISTS idx_guild_channels_guildId
ON guild_channels (guildId);