import { getItem } from "@modules/items/_items.js";
import { getUserItemSlots } from "@tables/inventory/inventory.js";

/**
 * Checks if the user has at least one valid option for every ingredient group.
 * Returns true only if every group has at least one option the user can afford.
 */
export const canCraft = (userId: string, itemId: string, quantity = 1): boolean => {
  const item = getItem(itemId);
  if (item === undefined || !item.craftable || item.ingredients === undefined) return false;

  for (const group of item.ingredients) {
    const groupSatisfied = group.some(([ingredientId, ingredientQuantity]) => {
      const slots = getUserItemSlots(userId, ingredientId);
      let total = 0;
      for (const slot of slots) total += slot.quantity;
      return total >= ingredientQuantity * quantity;
    });
    if (!groupSatisfied) return false;
  }

  return true;
};
