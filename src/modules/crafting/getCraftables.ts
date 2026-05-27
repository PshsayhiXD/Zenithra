import { getAllItems } from "@modules/items/_items.js";
import type { BaseItem } from "@modules/types/item.js";
import { canCraft } from "@modules/crafting/canCraft.js";

export const getCraftables = (userId?: string): BaseItem[] => {
  const all = getAllItems().filter(item => item.craftable && item.ingredients !== undefined);
  if (userId === undefined) return all;
  return all.filter(item => canCraft(userId, item.name));
};
