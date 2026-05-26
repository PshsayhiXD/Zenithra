import { defineItem, type ItemResult } from "@modules/types/item.js";

export default defineItem({
  id: 5,
  name: "Hyper Rubber",
  category: "currency",
  icon: "<:res_hyper_rubber:1502673706709680148>",
  description: "A very rare and bouncy currency. 100 can be compressed into Flux Crystals.",
  price: 10_000_000,
  usable: false,
  dependencies: ["code"],
  use: async ({ deps }): Promise<ItemResult> => {
    await Promise.resolve();
    return deps.code.Success;
  },
});
