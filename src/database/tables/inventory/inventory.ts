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
} from "@tables/inventory/_statements.js";

export const getUserInventory = (userId: InventoryUserId): InventoryRow[] => getUserInventoryStmt.all(userId);

export const getUserItem = (userId: InventoryUserId, itemId: InventoryItemId): InventoryRow | undefined => getUserItemStmt.get(userId, itemId) ?? undefined;

export const addItem = (userId: InventoryUserId, itemId: InventoryItemId, quantity: InventoryQuantity = 1): void => {
  addItemStmt.run(userId, itemId, quantity);
};

export const removeItem = (userId: InventoryUserId, itemId: InventoryItemId, quantity: InventoryQuantity = 1): boolean => {
  const result = removeItemStmt.run(quantity, userId, itemId, quantity);
  if (!result.changes) return false;

  deleteEmptyStackStmt.run(userId, itemId);
  return true;
};
