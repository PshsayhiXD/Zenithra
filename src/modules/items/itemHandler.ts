import {
  type Item,
  type ItemContext,
  type ItemResult,
  ItemCode,
} from "@modules/types/item.js";
import { getItem } from "@modules/items/_items.js";
import { getDeps } from "@/command/dependency/getDeps.js";
import { getUserItem, removeItem, updateDurability } from "@tables/inventory/inventory.js";

export const useItem = async (
  userId: string,
  itemId: string,
  quantity = 1,
  arguments_: string[] = []
): Promise<ItemResult> => {
  const resolveItem = getItem as (query: string | number) => Item | undefined;
  const item = resolveItem(itemId);
  if (item === undefined) return [ItemCode.notFound, "Item not found."];
  if (item.usable !== true || item.use === undefined) return [ItemCode.cannotUse, "This item is not usable."];

  const inventoryItem = getUserItem(userId, itemId);
  if (!inventoryItem || inventoryItem.quantity < quantity) return [ItemCode.notFound, `You don't have enough ${item.name}!`];

  // Handle durability if applicable
  if (item.maxDurability !== undefined) {
    const currentDurability = inventoryItem.durability ?? item.maxDurability;
    if (currentDurability <= 0) return [ItemCode.broken, `Your ${item.name} is broken!`];
  }

  // Resolve dependencies
  const deps = getDeps(item.dependencies);
  const context: ItemContext = {
    userId,
    item,
    quantity,
    args: arguments_,
    deps,
  };

  const result = await item.use(context);

  // Success logic: consume quantity or durability
  const [code] = Array.isArray(result) ? result : [result];
  if (code === 0 || code === 200) {
    if (item.maxDurability === undefined) removeItem(userId, itemId, quantity);
    else {
      const newDurability = (inventoryItem.durability ?? item.maxDurability) - 1;
      if (newDurability <= 0) removeItem(userId, itemId, 1);
      else updateDurability(userId, itemId, newDurability);
    }
  }

  return result;
};
