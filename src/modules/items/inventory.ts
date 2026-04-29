import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Item, ItemContext } from "@modules/types/item";
import { createLogger } from "@utilities/logger";

const log = createLogger("Items");

const items = new Map<string, Item>();
const itemsById = new Map<number, Item>();
const itemsByName = new Map<string, Item>();

interface ItemModuleExport {
  default?: unknown;
}

interface ItemDefinition extends Partial<Item> {
  execute: (context: ItemContext) => Promise<void>;
}

const hasExecute = (value: unknown): value is (context: ItemContext) => Promise<void> =>
  typeof value === "function";

const isItemDefinition = (value: unknown): value is ItemDefinition => {
  if (value === null || typeof value !== "object") return false;
  const maybe = value as { execute?: unknown };
  return hasExecute(maybe.execute);
};

export const createItem = (
  name: string,
  options: Partial<Item> = {},
  execute: (context: ItemContext) => Promise<void>
): void => {
  if (name === "" || typeof execute !== "function")
    throw new Error(`Missing name or execute for ${name}`);
  if (items.has(name))
    log.warn("Duplicate item", { name });
  const item: Item = {
    id: options.id ?? 0,
    name,
    category: options.category ?? "unknown",
    description: options.description ?? "",
    price: options.price ?? 0,
    usable: options.usable ?? false,
    use: execute
  };
  if (options.iconPath !== undefined) item.iconPath = options.iconPath;
  items.set(name, item);
  if (item.id !== 0) itemsById.set(item.id, item);
  itemsByName.set(name.toLowerCase(), item);
};

export const setItem = (name: string, data: Item): Item | undefined => {
  if (name === "") throw new Error("Invalid name or data");
  if (typeof data.use !== "function")
    throw new Error(`Missing use for ${name}`);
  createItem(name, data, data.use);
  return items.get(name) ?? undefined;
};

export const getItem = (query: string | number): Item | undefined => {
  const number_ = Number(query);
  if (!Number.isNaN(number_)) {
    const byId = itemsById.get(number_);
    if (byId) return byId;
  }
  return itemsByName.get(query.toString().toLowerCase()) ?? undefined;
};

export const getAllItems = (): Item[] => [...items.values()];

export const hasItem = (query: string | number): boolean =>
  getItem(query) !== undefined;

const itemsDirectory = __dirname;

export const loadAllItems = async (
  directory: string = itemsDirectory,
  prefix = ""
): Promise<void> => {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "index" || entry.name === "inventory") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await loadAllItems(
        fullPath,
        prefix === "" ? entry.name : `${prefix}.${entry.name}`
      );
      continue;
    }
    if (!entry.name.endsWith(".js") || entry.name === "_index.js") continue;
    const itemName = prefix === ""
      ? entry.name.slice(0, -3)
      : `${prefix}.${entry.name.slice(0, -3)}`;
    try {
      const module_: unknown = await import(pathToFileURL(fullPath).href);
      const exported = (module_ as ItemModuleExport).default ?? module_;
      if (hasExecute(exported)) {
        createItem(itemName, {}, exported);
        log.info("Item loaded", { itemName });
      } else if (isItemDefinition(exported)) {
        createItem(itemName, exported, exported.execute);
        log.info("Item loaded", { itemName });
      } else log.warn("Invalid item export skipped", { itemName, file: fullPath });
    } catch (error: unknown) {
      const error_ = error instanceof Error ? error : new Error(String(error));
      log.error(error_, {
        itemName,
        file: fullPath,
      });
    }
  }
  log.info("Items load complete", { total: items.size });
};
