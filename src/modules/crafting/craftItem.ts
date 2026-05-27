import {
  type IngredientOption,
  type CraftResult,
  CraftCode
} from "@modules/types/crafting.js";
import { getItem } from "@modules/items/getItem.js";
import { getUserItemSlots, addItem, removeItem } from "@tables/inventory/inventory.js";
import { validateIngredient } from "@modules/crafting/_validateIngredient.js";

/**
 * Crafts an item by consuming chosen ingredients from each group.
 *
 * @param chosenIngredients
 * One itemId chosen per ingredient group, in order
 *
 * @example
 * // item has ingredients: [
 * //   [["iron", 3], ["exp", 3]],  // group 0: pick one
 * //   [["silica", 1]],            // group 1: only option
 * // ]
 * craftItem(userId, "pusher", 1, ["iron", "silica"]);
 */
export const craftItem = (
  userId: string,
  itemId: string,
  quantity = 1,
  chosenIngredients: string[]
): CraftResult => {
  const item = getItem(itemId);
  if (item === undefined) return [CraftCode.notFound, "Item not found."];
  if (!item.craftable || item.ingredients === undefined || item.ingredients.length === 0)
    return [CraftCode.notCraftable, `${item.name} cannot be crafted.`];

  if (chosenIngredients.length !== item.ingredients.length)
    return [CraftCode.invalidIngredient, `Expected ${String(item.ingredients.length)} ingredient choices, got ${String(chosenIngredients.length)}.`];

  const resolved: IngredientOption[] = [];
  for (let index = 0; index < item.ingredients.length; index++) {
    const group = item.ingredients[index];
    const chosen = chosenIngredients[index];
    if (group === undefined || chosen === undefined)
      return [CraftCode.invalidIngredient, "Invalid ingredient group."];
    const result = validateIngredient(userId, group, chosen);
    if (!result.ok) return result.error;
    resolved.push(result.ingredient);
  }

  // Consume ingredients multiplied by quantity
  for (const [ingredientId, ingredientQuantity] of resolved) {
    const slots = getUserItemSlots(userId, ingredientId);
    let remaining = ingredientQuantity * quantity;
    for (const slot of slots) {
      if (remaining <= 0) break;
      const take = Math.min(slot.quantity, remaining);
      removeItem(userId, slot.hashId, take);
      remaining -= take;
    }
  }

  addItem(userId, item, quantity);
  return CraftCode.success;
};
