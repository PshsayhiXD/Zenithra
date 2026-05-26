import {
  type ItemContext,
  type ItemResult,
  ItemCode,
} from "@modules/types/item.js";
import { getItem } from "@modules/items/_items.js";
import { getDeps } from "@commands/dependency/getDeps.js";
import {
  getUserItem,
  removeItem,
  updateDurability,
} from "@tables/inventory/inventory.js";

export const useItem = async (
  userId: string,
  itemId: string,
  quantity = 1,
  arguments_: string[] = []
): Promise<ItemResult> => {
  const item = getItem(itemId);
  if (item === undefined) return [ItemCode.notFound, "Item not found."];
  if (item.usable !== true || item.use === undefined) return [ItemCode.cannotUse, "This item is not usable."];

  const inventoryItem = getUserItem(userId, itemId);
  if (!inventoryItem || inventoryItem.quantity < quantity) return [ItemCode.notEnough, `You don't have enough ${item.name}!`];
  if (item.maxDurability !== undefined) {
    const durability = inventoryItem.durability ?? item.maxDurability;
    if (durability <= 0) return [ItemCode.broken, `Your ${item.name} is broken!`];
  }

  const context: ItemContext = {
    userId,
    item,
    quantity,
    args: arguments_,
    deps: getDeps(item.dependencies),
  };

  const result = await item.use(context);
  const code = Array.isArray(result) ? result[0] : result;

  if (code !== ItemCode.success) return result;
  if (item.maxDurability === undefined) {
    removeItem(userId, itemId, quantity);
    return result;
  }
  const durability = (inventoryItem.durability ?? item.maxDurability) - 1;
  if (durability <= 0) removeItem(userId, itemId, 1);
  else updateDurability(userId, itemId, durability);
  return result;
};
