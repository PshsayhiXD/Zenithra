import { defineItem } from "@modules/types/item.js";
import { EMOJIS } from "@configs/emojis.js";

export default defineItem({
  id: 1,
  name: "Compressed Explosive",
  category: "resource",
  icon: EMOJIS.comp_exp,
  rarity: "none",
  description: "10 Metal compressed together. 10 can be compressed into Compressed Metal.",
  price: 100,
  usable: false,
  craftable: false,
  dependencies: [],
});
