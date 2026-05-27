import type { Item, ItemDependencyKey, BaseItem } from "@modules/types/item.js";

export const items = new Map<string, BaseItem>();
export const itemsById = new Map<number, BaseItem>();
export const itemsByName = new Map<string, BaseItem>();

export const registerItem = <T extends ItemDependencyKey>(
  key: string,
  item: Item<T>
): void => {
  items.set(key, item as unknown as BaseItem);
  if (item.id !== 0) itemsById.set(item.id, item as unknown as BaseItem);
  itemsByName.set(key.toLowerCase(), item as unknown as BaseItem);
};
