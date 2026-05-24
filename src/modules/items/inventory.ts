import type {
  InventoryItemId,
  InventoryQuantity,
  InventoryRow,
  InventoryUserId,
} from "@tables/types/inventory/index.js";
import {
  addItemStmt,
  deleteEmptyStackStmt,
  getUserInventoryStmt,
  getUserItemStmt,
  removeItemStmt,
  updateDurabilityStmt,
} from "@tables/inventory/_statements.js";

export const getUserInventory = (userId: InventoryUserId): InventoryRow[] => getUserInventoryStmt.all(userId);

export const getUserItem = (userId: InventoryUserId, itemId: InventoryItemId): InventoryRow | undefined => getUserItemStmt.get(userId, itemId) ?? undefined;

export const addItem = (
  userId: InventoryUserId,
  itemId: InventoryItemId,
  quantity: InventoryQuantity = 1,
  durability: number | null = null,
  maxDurability: number | null = null
): void => {
  addItemStmt.run(userId, itemId, quantity, durability, maxDurability);
};

export const removeItem = (userId: InventoryUserId, itemId: InventoryItemId, quantity: InventoryQuantity = 1): boolean => {
  const result = removeItemStmt.run(quantity, userId, itemId, quantity);
  if (!result.changes) return false;

  deleteEmptyStackStmt.run(userId, itemId);
  return true;
};

export const updateDurability = (
  userId: InventoryUserId,
  itemId: InventoryItemId,
  durability: number | null
): void => {
  updateDurabilityStmt.run(durability, userId, itemId);
};
