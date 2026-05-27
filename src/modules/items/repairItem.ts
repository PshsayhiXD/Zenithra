import {
  type RepairMaterial,
  type RepairResult,
  RepairCode
} from "@modules/types/item.js";
import { getItem } from "@modules/items/getItem.js";
import {
  getUserItemSlots,
  getUserItemByHash,
  removeItem,
  updateDurability,
} from "@tables/inventory/inventory.js";
import { validateMaterial } from "@modules/items/_validateMaterial.js";

/**
 * Repairs a durable item using chosen materials from each repair group.
 *
 * @param userId - The user performing the repair
 * @param hashId - The specific inventory slot of the item to repair
 * @param chosenMaterials - One itemId chosen per repair group, in order
 *
 * @example
 * // item has repairCost: [
 * //   [["comp_iron", 2, 10], ["comp_metal", 2, 10]],  // group 0: pick one
 * //   [["res_flux_crystals", 1, 50]],                 // group 1: only option
 * // ]
 * repairItem(userId, hashId, ["comp_iron", "res_flux_crystals"]);
 */
export const repairItem = (
  userId: string,
  hashId: number,
  chosenMaterials: string[]
): RepairResult => {
  const inventoryItem = getUserItemByHash(userId, hashId);
  if (inventoryItem === undefined) return [RepairCode.notFound, "Item slot not found."];

  const item = getItem(inventoryItem.itemId);
  if (item === undefined) return [RepairCode.notFound, "Item not found."];
  if (item.repairCost === undefined || item.maxDurability === undefined)
    return [RepairCode.notRepairable, `${item.name} cannot be repaired.`];

  const currentDurability = inventoryItem.durability ?? item.maxDurability;
  if (currentDurability >= item.maxDurability)
    return [RepairCode.alreadyFull, `${item.name} is already at full durability.`];

  if (chosenMaterials.length !== item.repairCost.length)
    return [RepairCode.invalidRecipe, `Expected ${String(item.repairCost.length)} material choices, got ${String(chosenMaterials.length)}.`];

  // Validate all groups before consuming anything
  const resolved: RepairMaterial[] = [];
  for (let index = 0; index < item.repairCost.length; index++) {
    const group = item.repairCost[index];
    const chosen = chosenMaterials[index];
    if (group === undefined || chosen === undefined)
      return [RepairCode.invalidRecipe, "Invalid repair recipe."];

    const result = validateMaterial(userId, group, chosen);
    if (!result.ok) return result.error;
    resolved.push(result.material);
  }

  // Consume materials and sum repair amount
  let totalRepair = 0;
  for (const [itemId, quantity, repairAmount] of resolved) {
    const slots = getUserItemSlots(userId, itemId);
    let remaining = quantity;
    for (const slot of slots) {
      if (remaining <= 0) break;
      const take = Math.min(slot.quantity, remaining);
      removeItem(userId, slot.hashId, take);
      remaining -= take;
    }
    totalRepair += repairAmount;
  }

  const newDurability = Math.min(currentDurability + totalRepair, item.maxDurability);
  updateDurability(userId, hashId, newDurability);
  return RepairCode.success;
};
