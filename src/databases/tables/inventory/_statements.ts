import { getDatabase } from "@databases/index.js";
import type {
  InventoryItemId,
  InventoryQuantity,
  InventoryRow,
  InventoryUserId,
} from "@tables/types/inventory/index.js";
import type { RunResult, Statement } from "better-sqlite3";

const database = getDatabase();

export const getUserInventoryStmt: Statement<[InventoryUserId], InventoryRow> =
  database.prepare("SELECT * FROM inventory WHERE userId = ?");

export const getUserItemStmt: Statement<[InventoryUserId, InventoryItemId], InventoryRow> =
  database.prepare("SELECT * FROM inventory WHERE userId = ? AND itemId = ?");

export const addItemStmt: Statement<[number, InventoryUserId, InventoryItemId, InventoryQuantity, string, number | null, number | null, number | null], RunResult
> = database.prepare(`
  INSERT INTO inventory (hashId, userId, itemId, quantity, metadata, durability, maxDurability, charges)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (hashId) DO UPDATE SET
    quantity = quantity + excluded.quantity,
    durability = COALESCE(excluded.durability, durability),
    maxDurability = COALESCE(excluded.maxDurability, maxDurability),
    charges = COALESCE(excluded.charges, charges)
`);

export const removeItemStmt: Statement<[InventoryQuantity, number, InventoryUserId, InventoryQuantity], RunResult> =
  database.prepare(`
    UPDATE inventory SET quantity = quantity - ?
    WHERE hashId = ? AND userId = ? AND quantity >= ?
  `);

export const deleteEmptyStackStmt: Statement<[number, InventoryUserId], RunResult> =
  database.prepare("DELETE FROM inventory WHERE hashId = ? AND userId = ? AND quantity <= 0");

export const updateDurabilityStmt: Statement<[number | null, number, InventoryUserId], RunResult> =
  database.prepare("UPDATE inventory SET durability = ? WHERE hashId = ? AND userId = ?");

export const getUserItemSlotsStmt: Statement<[InventoryUserId, InventoryItemId], InventoryRow> =
  database.prepare("SELECT * FROM inventory WHERE userId = ? AND itemId = ?");

export const updateChargesStmt: Statement<[number | null, number, InventoryUserId]> =
  database.prepare("UPDATE inventory SET charges = ? WHERE hashId = ? AND userId = ?");

export const updateMetadataStmt: Statement<[number, string, number, InventoryUserId]> =
  database.prepare("UPDATE inventory SET hashId = ?, metadata = ? WHERE hashId = ? AND userId = ?");

export const getUserItemByHashStmt: Statement<[number, InventoryUserId], InventoryRow> =
  database.prepare("SELECT * FROM inventory WHERE hashId = ? AND userId = ?");
