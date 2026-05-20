ALTER TABLE users ADD COLUMN username TEXT;

ALTER TABLE users ADD COLUMN usernameSkippedAt INTEGER;

ALTER TABLE users ADD COLUMN usernameMigrationPromptedAt INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
ON users (username)
WHERE username IS NOT NULL;
