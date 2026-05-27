import type { Item } from "@modules/types/item.js";
import { items, itemsById, itemsByName, registerItem } from "@modules/items/_registry.js";
import { createItem } from "@modules/items/createItem.js";
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("ItemLoader");

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

const getDefaultExport = (module_: unknown): unknown => {
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

export const loadItems = (loadedItems: Item[]): void => {
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
