import { items } from "@modules/items/_registry.js";
import { getItem } from "@modules/items/getItem.js";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("ValidateIds");

/**
 * Will logs out warnings.
 */
export const validateItemReferences = (): void => {
  for (const item of items.values()) {

    // validate ingredients
    if (item.ingredients !== undefined) {
      for (const group of item.ingredients) {
        for (const [id] of group) {
          if (getItem(id) === undefined)
            logger.warn(`ingredient id "${String(id)}" not found`, { item: item.name });
        }
      }
    }

    // validate repairCost
    if (item.repairCost !== undefined) {
      for (const group of item.repairCost) {
        for (const [id] of group) {
          if (getItem(id) === undefined)
            logger.warn(`repairCost id "${String(id)}" not found`, { item: item.name });
        }
      }
    }

    // validate salvageYield
    if (item.salvageYield !== undefined) {
      for (const [id] of item.salvageYield) {
        if (getItem(id) === undefined)
          logger.warn(`salvageYield id "${String(id)}" not found`, { item: item.name });
      }
    }
  }
};
