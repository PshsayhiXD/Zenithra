import { getDatabase } from "@database/index.js";
import type {
  InventoryItemId,
  InventoryQuantity,
  InventoryRow,
  InventoryUserId,
} from "@tables/types/inventory/index.js";
import type { RunResult, Statement } from "better-sqlite3";

const database = getDatabase();

export const getUserInventoryStmt: Statement<[InventoryUserId], InventoryRow> = database.prepare(
  "SELECT * FROM inventory WHERE userId = ?",
);

export const getUserItemStmt: Statement<[InventoryUserId, InventoryItemId], InventoryRow> =
  database.prepare("SELECT * FROM inventory WHERE userId = ? AND itemId = ?");

export const addItemStmt: Statement<
  [InventoryUserId, InventoryItemId, InventoryQuantity, number | null, number | null],
  RunResult
> = database.prepare(`
  INSERT INTO inventory (userId, itemId, quantity, durability, maxDurability)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT (userId, itemId) DO UPDATE SET
    quantity = quantity + excluded.quantity,
    durability = COALESCE(excluded.durability, durability),
    maxDurability = COALESCE(excluded.maxDurability, maxDurability)
`);

export const removeItemStmt: Statement<
  [InventoryQuantity, InventoryUserId, InventoryItemId, InventoryQuantity],
  RunResult
> = database.prepare(`
  UPDATE inventory SET quantity = quantity - ?
  WHERE userId = ? AND itemId = ? AND quantity >= ?
`);

export const deleteEmptyStackStmt: Statement<[InventoryUserId, InventoryItemId], RunResult> =
  database.prepare(`
  DELETE FROM inventory WHERE userId = ? AND itemId = ? AND quantity <= 0
`);

export const updateDurabilityStmt: Statement<
  [number | null, InventoryUserId, InventoryItemId],
  RunResult
> = database.prepare(`
  UPDATE inventory SET durability = ?
  WHERE userId = ? AND itemId = ?
`);
