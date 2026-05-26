import { defineItem, type ItemResult } from "@modules/types/item.js";

export default defineItem({
  id: 7,
  name: "Metal",
  category: "currency",
  icon: "<:res_metal:1502673731242299492>",
  description: "A solid currency. 10 can be compressed into Compressed Explosives.",
  price: 10,
  usable: false,
  dependencies: ["code"],
  use: async ({ deps }): Promise<ItemResult> => {
    await Promise.resolve();
    return deps.code.Success;
  },
});
