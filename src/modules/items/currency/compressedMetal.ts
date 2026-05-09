import type { Item, ItemResult } from "@modules/types/item.js";

export default {
  id: 2,
  name: "Compressed Metal",
  category: "currency",
  icon: "<:comp_iron:1502673596638564562>",
  description: "10 Compressed Explosives compressed together. 100 can be compressed into Silica Crystals.",
  price: 1000,
  usable: false,
  dependencies: ["code"],
  use: async ({ deps }): Promise<ItemResult> => {
    await Promise.resolve();
    return deps.code.Success;
  },
} satisfies Partial<Item<"code">>;
