import type { Item, ItemResult } from "@modules/types/item.js";

export default {
  id: 4,
  name: "Flux Crystal",
  category: "currency",
  icon: "<:res_flux_crystals:1502673687160291450>",
  description: "The rarest currency in the universe.",
  price: 1_000_000_000,
  usable: false,
  dependencies: ["code"],
  use: async ({ deps }): Promise<ItemResult> => {
    await Promise.resolve();
    return deps.code.Success;
  },
} satisfies Partial<Item<"code">>;
