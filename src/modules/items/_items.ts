import type {
  Item,
  ItemDependencyKey,
  BaseItem,
} from "@modules/types/item.js";
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("ItemLoader");

export const items = new Map<string, BaseItem>();
const itemsById = new Map<number, BaseItem>();
const itemsByName = new Map<string, BaseItem>();

export const isItem = (value: unknown): value is Item => {
  if (value === null || typeof value !== "object") return false;
  const object = value as Partial<Item>;
  return (
    typeof object.id === "number" &&
    typeof object.name === "string" &&
    typeof object.category === "string" &&
    typeof object.description === "string" &&
    typeof object.price === "number" &&
    Array.isArray(object.dependencies) &&
    object.dependencies.every(dep => typeof dep === "string")
  );
};

const registerItem = <T extends ItemDependencyKey>(
  key: string,
  item: Item<T>
): void => {
  items.set(key, item as unknown as BaseItem);
  if (item.id !== 0) itemsById.set(item.id, item as unknown as BaseItem);
  itemsByName.set(key.toLowerCase(), item as unknown as BaseItem);
};
const getDefaultExport = (
  module_: unknown
): unknown => {
  if (module_ === null || typeof module_ !== "object") return module_;
  const levelOne = module_ as { default?: unknown };

  if (
    levelOne.default !== undefined &&
    levelOne.default !== null &&
    typeof levelOne.default === "object"
  ) {
    const levelTwo = levelOne.default as { default?: unknown };
    return (levelTwo.default ?? levelOne.default);
  }
  return levelOne.default ?? module_;
};

export const createItem = <T extends ItemDependencyKey>(
  name: string,
  options: Partial<Item<T>> = {}
): Item<T> => {
  if (name === "") throw new Error("Missing name for item");
  if (items.has(name)) logger.warn("Duplicate item", { name });

  // Update this as the BaseItem updated
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
    // usage
    ...(options.cooldown === undefined ? {} : { cooldown: options.cooldown }),
    ...(options.targetType === undefined ? {} : { targetType: options.targetType }),
    ...(options.use === undefined ? {} : { use: options.use }),
    // progression
    ...(options.rarity === undefined ? {} : { rarity: options.rarity }),
    ...(options.weight === undefined ? {} : { weight: options.weight }),
    // crafting
    ...(options.craftable === undefined ? {} : { craftable: options.craftable }),
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

export const getItem = (
  query: string | number
): BaseItem | undefined => {
  const number_ = Number(query);
  if (!Number.isNaN(number_)) {
    const byId = itemsById.get(number_);
    if (byId) return byId;
  }
  return (
    items.get(query.toString()) ??
    itemsByName.get(query.toString().toLowerCase()) ??
    undefined
  );
};
export const getAllItems = (): BaseItem[] => [...items.values()];

export const loadItems = (
  loadedItems: Item[]
): void => {
  items.clear();
  itemsById.clear();
  itemsByName.clear();
  for (const item of loadedItems) registerItem(item.name, item);
};
export const readItems = async (
  directory: string = __dirname,
  prefix = ""
): Promise<Item[]> => {
  const itemsList: Item[] = [];
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "index" || entry.name === "inventory" || entry.name.startsWith("_")) continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        const subItems = await readItems(fullPath, prefix === "" ? entry.name : `${prefix}.${entry.name}`);
        itemsList.push(...subItems);
        continue;
      }
      if (!entry.name.endsWith(".js")) continue;
      const itemName = prefix === "" ? entry.name.slice(0, -3) : `${prefix}.${entry.name.slice(0, -3)}`;
      const module_: unknown = await import(pathToFileURL(fullPath).href);
      const resolved = getDefaultExport(module_);
      if (isItem(resolved)) {
        registerItem(itemName, resolved);
        itemsList.push(resolved);
        continue;
      }
      if (resolved === null || typeof resolved !== "object") continue;
      const created = createItem(itemName, resolved as Item);
      itemsList.push(created);
    }
  } catch (error: unknown) {
    logger.error(error as Error, { directory });
  }
  return itemsList;
};
