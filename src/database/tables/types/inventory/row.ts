import type { InventoryItemId } from "@tables/types/inventory/itemId";
import type { InventoryQuantity } from "@tables/types/inventory/quantity";
import type { InventoryUserId } from "@tables/types/inventory/userId";

export interface InventoryRow {
  userId: InventoryUserId;
  itemId: InventoryItemId;
  quantity: InventoryQuantity;
}
