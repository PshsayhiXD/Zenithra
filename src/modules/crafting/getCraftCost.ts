import { getItem } from "@modules/items/_items.js";
import type { BaseItem } from "@modules/types/item.js";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("CraftCost");

export interface ResolvedIngredientGroup {
  /** All options in this group with their resolved item. */
  options: { item: BaseItem; quantity: number }[];
}

/**
 * Resolves the craft cost of an item into display-friendly groups.
 * Returns undefined if item is not craftable or ingredients are missing.
 */
export const getCraftCost = (itemId: string, quantity = 1): ResolvedIngredientGroup[] | undefined => {
  const item = getItem(itemId);
  if (item === undefined || !item.craftable || item.ingredients === undefined) return undefined;

  const resolved: ResolvedIngredientGroup[] = [];

  for (const group of item.ingredients) {
    const options: ResolvedIngredientGroup["options"] = [];
    for (const [ingredientId, ingredientQuantity] of group) {
      const ingredient = getItem(ingredientId);
      if (ingredient === undefined) {
        logger.warn(`ingredient "${ingredientId}" not found`, { item: item.name });
        continue;
      }
      options.push({ item: ingredient, quantity: ingredientQuantity * quantity });
    }
    if (options.length > 0) resolved.push({ options });
  }

  return resolved;
};
