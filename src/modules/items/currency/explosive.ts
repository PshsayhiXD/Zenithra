import { defineItem, type ItemResult } from "@modules/types/item.js";

export default defineItem({
  id: 3,
  name: "Explosive",
  category: "currency",
  icon: "<:res_explosives:1502673665106514132>",
  description: "The cheapest currency. 10 can be compressed into Metal.",
  price: 1,
  usable: false,
  dependencies: ["code"],
  use: async ({ deps }): Promise<ItemResult> => {
    await Promise.resolve();
    return deps.code.Success;
  },
});
