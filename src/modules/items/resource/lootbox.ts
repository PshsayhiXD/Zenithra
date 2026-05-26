import { defineItem, type ItemResult } from "@modules/types/item.js";
import { EMOJIS } from "@configs/emojis.js";

export default defineItem({
  id: 6,
  name: "Eliminate Loot Box",
  category: "resource",
  icon: EMOJIS.elim_loot_box,
  rarity: "uncommon",
  description: "A loot box that contains Hyper Rubber and Silica Crystals.",
  price: 500_000,
  usable: true,
  dependencies: ["tables", "code", "module.items"],
  // eslint-disable-next-line @typescript-eslint/require-await
  use: async ({ userId, quantity = 1, deps }): Promise<ItemResult> => {
    const { tables, code, "module.items": items } = deps;

    const hyperRubber = items.get("currency.hyperRubber");
    const silicaCrystal = items.get("currency.silicaCrystal");
    if (hyperRubber === undefined || silicaCrystal === undefined)
      return [code.UserDefinedError, "Loot table items are missing."];

    let rubberCount = 0;
    let silicaCount = 0;
    for (let index = 0; index < quantity; index++) {
      // 20% chance: 1-2x Hyper Rubber
      if (Math.random() < 0.2) rubberCount += Math.floor(Math.random() * 2) + 1;
      // 100% chance: 2-6x Silica Crystals
      silicaCount += Math.floor(Math.random() * 5) + 2;
    }

    if (rubberCount > 0) tables.Inventory.addItem(userId, hyperRubber, rubberCount);
    if (silicaCount > 0) tables.Inventory.addItem(userId, silicaCrystal, silicaCount);

    return code.Success;
  },
});
