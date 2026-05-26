import { defineItem, type ItemResult } from "@modules/types/item.js";

export default defineItem({
  id: 8,
  name: "Silica Crystal",
  category: "currency",
  icon: "<:res_silica_crystals:1502673754390790184>",
  description: "A rare and shiny currency. 100 can be compressed into Hyper Rubber.",
  price: 100_000,
  usable: false,
  dependencies: ["code"],
  use: async ({ deps }): Promise<ItemResult> => {
    await Promise.resolve();
    return deps.code.Success;
  },
});
