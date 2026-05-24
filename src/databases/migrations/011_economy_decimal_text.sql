CREATE TABLE economy_decimal_text (
  userId TEXT PRIMARY KEY,
  currency TEXT NOT NULL DEFAULT '0',
  bank TEXT NOT NULL DEFAULT '0',
  bankCapacity TEXT NOT NULL DEFAULT '0.00001',
  streak INTEGER NOT NULL DEFAULT 0,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO economy_decimal_text (userId, currency, bank, bankCapacity, streak, updatedAt)
SELECT
  userId,
  printf('%.16f', CAST(currency AS REAL)),
  printf('%.16f', CAST(bank AS REAL)),
  printf('%.16f', CAST(bankCapacity AS REAL)),
  streak,
  updatedAt
FROM economy;

DROP TABLE economy;

ALTER TABLE economy_decimal_text RENAME TO economy;

CREATE INDEX IF NOT EXISTS idx_economy_currency ON economy(currency);
