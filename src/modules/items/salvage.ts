import type { BaseItem } from "@modules/types/item.js";
import { getItem } from "@modules/items/_items.js";
import { addItem } from "@tables/inventory/inventory.js";

/**
 * Salvages an item, granting the user a random quantity of each yield entry.
 * Called when a durable/charged item breaks, if salvageable is true.
 */
export const salvageItem = (userId: string, item: BaseItem): void => {
  if (!(item.salvageable ?? false) || item.salvageYield === undefined) return;
  for (const [itemId, min, max] of item.salvageYield) {
    const target = getItem(itemId);
    if (target === undefined) continue;
    const quantity = Math.floor(Math.random() * (max - min + 1)) + min;
    if (quantity <= 0) continue;
    addItem(userId, target, quantity);
  }
};
