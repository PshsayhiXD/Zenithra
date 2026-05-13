CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS guilds (
  id TEXT PRIMARY KEY,
  prefix TEXT NOT NULL DEFAULT '!',
  hashCache TEXT NOT NULL DEFAULT '',
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cooldowns (
  userId TEXT NOT NULL,
  command TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  PRIMARY KEY (userId, command)
);

CREATE INDEX IF NOT EXISTS idx_cooldowns_expiresAt
ON cooldowns (expiresAt);