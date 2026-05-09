import type { Item, ItemResult } from "@modules/types/item.js";

export default {
  id: 1,
  name: "Compressed Explosive",
  category: "currency",
  icon: "<:comp_exp:1502673571594502295>",
  description: "10 Metal compressed together. 10 can be compressed into Compressed Metal.",
  price: 100,
  usable: false,
  dependencies: ["code"],
  use: async ({ deps }): Promise<ItemResult> => {
    await Promise.resolve();
    return deps.code.Success;
  },
} satisfies Partial<Item<"code">>;
