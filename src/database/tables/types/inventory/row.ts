import type { InventoryItemId } from "@tables/types/inventory/itemId.js";
import type { InventoryQuantity } from "@tables/types/inventory/quantity.js";
import type { InventoryUserId } from "@tables/types/inventory/userId.js";

export interface InventoryRow {
  userId: InventoryUserId;
  itemId: InventoryItemId;
  quantity: InventoryQuantity;
}
