import type { Item, ItemDependencyKey } from "@modules/types/item.js";
import { items, registerItem } from "@modules/items/_registry.js";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("ItemLoader");

export const createItem = <T extends ItemDependencyKey>(
  name: string,
  options: Partial<Item<T>> = {}
): Item<T> => {
  if (name === "") throw new Error("Missing name for item");
  if (items.has(name)) logger.warn("Duplicate item", { name });

  const item: Item<T> = {
    id: options.id ?? 0,
    name: options.name ?? name,
    category: options.category ?? "unknown",
    description: options.description ?? "",
    price: options.price ?? 0,
    usable: options.usable ?? false,
    dependencies: options.dependencies ?? [],
    rarity: options.rarity ?? "none",
    // durability system
    ...(options.durability === undefined ? {} : { durability: options.durability }),
    ...(options.maxDurability === undefined ? {} : { maxDurability: options.maxDurability }),
    // charge system
    ...(options.charges === undefined ? {} : { charges: options.charges }),
    // repair
    ...(options.repairAmount === undefined ? {} : { repairAmount: options.repairAmount }),
    ...(options.repairCost === undefined ? {} : { repairCost: options.repairCost }),
    // usage
    ...(options.cooldown === undefined ? {} : { cooldown: options.cooldown }),
    ...(options.targetType === undefined ? {} : { targetType: options.targetType }),
    ...(options.use === undefined ? {} : { use: options.use }),
    // progression
    ...(options.weight === undefined ? {} : { weight: options.weight }),
    // crafting
    craftable: options.craftable ?? false,
    ...(options.ingredients === undefined ? {} : { ingredients: options.ingredients }),
    // salvage
    ...(options.salvageable === undefined ? {} : { salvageable: options.salvageable }),
    ...(options.salvageYield === undefined ? {} : { salvageYield: options.salvageYield }),
  };

  if (options.iconPath !== undefined) item.iconPath = options.iconPath;
  if (options.icon !== undefined) item.icon = options.icon;
  registerItem(name, item);
  return item;
};
