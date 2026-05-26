import type { InventoryItemId } from "@tables/types/inventory/itemId.js";
import type { InventoryQuantity } from "@tables/types/inventory/quantity.js";
import type { InventoryUserId } from "@tables/types/inventory/userId.js";

export interface InventoryRow {
  /** Hash id of the item for uniqueness */
  hashId: number,
  userId: InventoryUserId;
  itemId: InventoryItemId;
  quantity: InventoryQuantity;
  metadata: string;
  durability: number | null;
  maxDurability: number | null;
  /** Remaining charges. Null if the item does not use a charge system. */
  charges: number | null;
  // TODO: cooldownExpiresAt: number | null - unix timestamp, needs cooldown system
  // TODO: equippedSlot: string | null - for equipment/loadout system
}
