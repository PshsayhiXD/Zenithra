CREATE TABLE IF NOT EXISTS economy (
  userId TEXT PRIMARY KEY,
  dredcoin INTEGER NOT NULL DEFAULT 0,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_economy_dredcoin ON economy(dredcoin);
