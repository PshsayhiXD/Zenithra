import {
  type RepairGroup,
  type RepairMaterial,
  type RepairResult,
  RepairCode
} from "@modules/types/item.js";
import type { ItemIdValue } from "@modules/items/_ids.js";
import { getItem } from "@modules/items/getItem.js";
import { getUserItemSlots } from "@tables/inventory/inventory.js";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("RepairItem");

export type ValidateMaterialResult =
  | { ok: true; material: RepairMaterial }
  | { ok: false; error: RepairResult };

/**
 * Validates that the user has the chosen material and the material exists.
 * Returns the material entry if valid, or an error result.
 */
export const validateMaterial = (
  userId: string,
  group: RepairGroup,
  chosenItemId: ItemIdValue
): ValidateMaterialResult => {
  const option = group.find(([itemId]) => itemId === chosenItemId);
  if (option === undefined)
    return { ok: false, error: [RepairCode.invalidRecipe, `"${String(chosenItemId)}" is not a valid option for this repair group.`] };

  const [itemId, quantity] = option;
  const target = getItem(itemId);
  if (target === undefined) {
    logger.warn(`repairCost item "${String(itemId)}" not found`);
    return { ok: false, error: [RepairCode.invalidRecipe, `Repair material "${String(itemId)}" does not exist.`] };
  }

  const slots = getUserItemSlots(userId, itemId);
  let total = 0;
  for (const slot of slots) total += slot.quantity;
  if (total < quantity)
    return { ok: false, error: [RepairCode.missingMaterial, `You need ${String(quantity)}x ${target.name} to repair.`] };

  return { ok: true, material: option };
};
