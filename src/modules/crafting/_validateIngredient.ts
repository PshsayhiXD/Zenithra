import {
  type IngredientGroup,
  type IngredientOption,
  type CraftResult,
  CraftCode
} from "@modules/types/crafting.js";
import { getItem } from "@modules/items/getItem.js";
import { getUserItemSlots } from "@tables/inventory/inventory.js";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("CraftItem");

type ValidateIngredientResult =
  | { ok: true; ingredient: IngredientOption }
  | { ok: false; error: CraftResult };

export const validateIngredient = (
  userId: string,
  group: IngredientGroup,
  chosenItemId: number
): ValidateIngredientResult => {
  const option = group.find(([itemId]) => itemId === chosenItemId);
  if (option === undefined)
    return { ok: false, error: [CraftCode.invalidIngredient, `"${String(chosenItemId)}" is not a valid option for this ingredient group.`] };

  const [itemId, quantity] = option;
  const ingredient = getItem(itemId);
  if (ingredient === undefined) {
    logger.warn(`ingredient "${String(itemId)}" not found`);
    return { ok: false, error: [CraftCode.invalidIngredient, `Ingredient "${String(itemId)}" does not exist.`] };
  }

  const slots = getUserItemSlots(userId, itemId);
  let total = 0;
  for (const slot of slots) total += slot.quantity;
  if (total < quantity)
    return { ok: false, error: [CraftCode.missingIngredient, `You need ${String(quantity)}x ${ingredient.name} to craft this item.`] };

  return { ok: true, ingredient: option };
};
