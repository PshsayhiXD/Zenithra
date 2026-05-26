import type {
  InventoryItemId,
  InventoryQuantity,
  InventoryRow,
  InventoryUserId,
} from "@tables/types/inventory/index.js";
import type { BaseItem } from "@/modules/types/item.js";
import {
  addItemStmt,
  deleteEmptyStackStmt,
  getUserItemByHashStmt,
  getUserInventoryStmt,
  getUserItemStmt,
  getUserItemSlotsStmt,
  updateChargesStmt,
  updateMetadataStmt,
  removeItemStmt,
  updateDurabilityStmt,
} from "@tables/inventory/_statements.js";
import { hashText } from "@utilities/hash.js";

export const getUserInventory = (userId: InventoryUserId): InventoryRow[] =>
  getUserInventoryStmt.all(userId);

/** Get the first matching slot. Useful when metadata doesn't matter (e.g. checking if user owns any). */
export const getUserItem = (userId: InventoryUserId, itemId: InventoryItemId): InventoryRow | undefined =>
  getUserItemStmt.get(userId, itemId) ?? undefined;

/** Get all slots for an item. Use when metadata/durability differences matter. */
export const getUserItemSlots = (userId: InventoryUserId, itemId: InventoryItemId): InventoryRow[] =>
  getUserItemSlotsStmt.all(userId, itemId);

export const getUserItemByHash = (userId: InventoryUserId, hashId: number): InventoryRow | undefined =>
  getUserItemByHashStmt.get(hashId, userId) ?? undefined;

export const addItem = (
  userId: InventoryUserId,
  item: BaseItem,
  quantity: InventoryQuantity = 1,
  metadata = ""
): number => {
  const hashId = hashText(userId + item.name + metadata);
  addItemStmt.run(
    hashId,
    userId,
    item.name,
    quantity,
    metadata,
    item.durability ?? null,
    item.maxDurability ?? null,
    item.charges ?? null,
  );
  return hashId;
};

export const removeItem = (userId: InventoryUserId, hashId: number, quantity: InventoryQuantity = 1): boolean => {
  const result = removeItemStmt.run(quantity, hashId, userId, quantity);
  if (!result.changes) return false;
  deleteEmptyStackStmt.run(hashId, userId);
  return true;
};

export const updateDurability = (userId: InventoryUserId, hashId: number, durability: number | null): void => {
  updateDurabilityStmt.run(durability, hashId, userId);
};

export const updateCharges = (userId: InventoryUserId, hashId: number, charges: number | null): void => {
  updateChargesStmt.run(charges, hashId, userId);
};
/**
 * @returns
 * The new HashId
 */
export const updateMetadata = (
  userId: InventoryUserId,
  item: BaseItem,
  oldHashId: number,
  newMetadata: string
): number | undefined => {
  const existing = getUserItemByHash(userId, oldHashId);
  if (existing === undefined) return undefined;
  const newHashId = hashText(userId + item.name + newMetadata);
  updateMetadataStmt.run(newHashId, newMetadata, oldHashId, userId);
  return newHashId;
};
