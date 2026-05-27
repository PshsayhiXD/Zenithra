import type { BaseItem } from "@modules/types/item.js";
import { items, itemsById, itemsByName } from "@modules/items/_registry.js";

export const getItem = (query: string | number): BaseItem | undefined => {
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
