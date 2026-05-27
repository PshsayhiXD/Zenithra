CREATE TABLE inventory_new (
  hashId INTEGER NOT NULL,
  userId TEXT NOT NULL,
  itemId INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  metadata TEXT NOT NULL DEFAULT '',
  durability INTEGER,
  maxDurability INTEGER,
  charges INTEGER,
  PRIMARY KEY (hashId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

DROP TABLE inventory;
ALTER TABLE inventory_new RENAME TO inventory;

CREATE INDEX IF NOT EXISTS idx_inventory_userId ON inventory(userId);
CREATE INDEX IF NOT EXISTS idx_inventory_hashId ON inventory(hashId);
