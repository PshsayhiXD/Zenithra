import { defineItem, type ItemResult } from "@modules/types/item.js";

export default defineItem({
  id: 6,
  name: "Eliminate Loot Box",
  category: "currency",
  icon: "<:loot_box:1502673621309718678>",
  description: "A loot box that contains Hyper Rubber and Silica Crystals.",
  price: 500_000,
  usable: true,
  dependencies: ["tables", "code"],
  use: async ({ userId, quantity = 1, deps }): Promise<ItemResult> => {
    await Promise.resolve();
    const { tables, code } = deps;

    const removed = tables.Inventory.removeItem(userId, "currency.lootbox", quantity);
    if (!removed) return [code.UserDefinedError, "You don't have enough Eliminate Loot Boxes!"];

    let rubberCount = 0;
    let iceCount = 0;
    for (let index = 0; index < quantity; index++) {
      if (Math.random() < 0.2) rubberCount += Math.floor(Math.random() * 2) + 1;
      iceCount += Math.floor(Math.random() * 5) + 2;
    }

    if (rubberCount > 0) tables.Inventory.addItem(userId, "currency.hyperRubber", rubberCount);
    if (iceCount > 0) tables.Inventory.addItem(userId, "currency.silicaCrystal", iceCount);

    return code.Success;
  },
});
