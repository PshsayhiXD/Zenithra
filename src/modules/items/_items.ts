import type { Item, ItemDefinition, ItemDependencyKey, ItemExecutor } from "@modules/types/item.js";
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("ItemLoader");

const items = new Map<string, Item>();
const itemsById = new Map<number, Item>();
const itemsByName = new Map<string, Item>();

export const isItem = (value: unknown): value is Item => {
  if (value === null || typeof value !== "object") return false;
  const object = value as Partial<Item>;
  return (
    typeof object.name === "string" &&
    typeof object.id === "number" &&
    typeof object.category === "string" &&
    typeof object.description === "string" &&
    typeof object.price === "number" &&
    Array.isArray(object.dependencies)
  );
};

const getDefaultExport = (module_: unknown): unknown => {
  if (module_ === null || typeof module_ !== "object") return module_;
  const levelOne = module_ as { default?: unknown };
  if (levelOne.default !== undefined && levelOne.default !== null && typeof levelOne.default === "object") {
    const levelTwo = levelOne.default as { default?: unknown };
    return levelTwo.default ?? levelOne.default;
  }
  return levelOne.default ?? module_;
};

export const createItem = <T extends ItemDependencyKey>(
  name: string,
  options: Partial<Item<T>> = {},
  execute?: ItemExecutor<T>
): void => {
  if (name === "") throw new Error("Missing name for item");
  if (items.has(name)) logger.warn("Duplicate item", { name });

  const item: Item<T> = {
    id: options.id ?? 0,
    name: options.name ?? name,
    category: options.category ?? "unknown",
    description: options.description ?? "",
    price: options.price ?? 0,
    usable: options.usable ?? false,
    durability: options.durability,
    maxDurability: options.maxDurability,
    dependencies: options.dependencies ?? ([] as unknown as T[]),
    use: execute ?? options.use,
  };

  if (options.iconPath !== undefined) item.iconPath = options.iconPath;
  if (options.icon !== undefined) item.icon = options.icon;

  items.set(name, item as unknown as Item);
  if (item.id !== 0) itemsById.set(item.id, item as unknown as Item);
  itemsByName.set(name.toLowerCase(), item as unknown as Item);
};

export const getItem = (query: string | number): Item | undefined => {
  const number_ = Number(query);
  if (!Number.isNaN(number_)) {
    const byId = itemsById.get(number_);
    if (byId) return byId;
  }
  return items.get(query.toString()) ?? itemsByName.get(query.toString().toLowerCase()) ?? undefined;
};

export const getAllItems = (): Item[] => [...items.values()];

export const loadItems = (loadedItems: Item[]): void => {
  items.clear();
  itemsById.clear();
  itemsByName.clear();
  for (const item of loadedItems) {
    items.set(item.name, item); // path-based name
    if (item.id !== 0) itemsById.set(item.id, item);
    itemsByName.set(item.name.toLowerCase(), item);
  }
};

export const readItems = async (directory: string = __dirname, prefix = ""): Promise<Item[]> => {
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

      const itemName = prefix === ""
        ? entry.name.slice(0, -3)
        : `${prefix}.${entry.name.slice(0, -3)}`;

      const module_: unknown = await import(pathToFileURL(fullPath).href);
      const resolved = getDefaultExport(module_);

      if (isItem(resolved)) {
        // If it's already a full Item object
        items.set(itemName, resolved);
        if (resolved.id !== 0) itemsById.set(resolved.id, resolved);
        itemsByName.set(itemName.toLowerCase(), resolved);
        itemsList.push(resolved);
      } else if (typeof resolved === "object" && resolved !== null) {
        // If it's a partial item definition that needs createItem
        const options = resolved as ItemDefinition;
        const execute = typeof options.execute === "function" ? options.execute : undefined;
        const created: Item = {
          id: options.id ?? 0,
          name: options.name ?? itemName,
          category: options.category ?? "unknown",
          description: options.description ?? "",
          price: options.price ?? 0,
          usable: options.usable ?? false,
          durability: options.durability,
          maxDurability: options.maxDurability,
          dependencies: options.dependencies ?? [],
          ...(options.iconPath === undefined ? {} : { iconPath: options.iconPath }),
          ...(options.icon === undefined ? {} : { icon: options.icon }),
          ...(execute === undefined ? {} : { use: execute }),
        };

        items.set(itemName, created);
        if (created.id !== 0) itemsById.set(created.id, created);
        itemsByName.set(itemName.toLowerCase(), created);
        itemsList.push(created);
      }
    }
  } catch (error: unknown) {
    logger.error(error as Error, { directory });
  }
  return itemsList;
};
