import { defineItem } from "@modules/types/item.js";
import { EMOJIS } from "@configs/emojis.js";

export default defineItem({
  id: 3,
  name: "Explosive",
  category: "resource",
  icon: EMOJIS.res_explosives,
  rarity: "none",
  description: "The cheapest currency. 10 can be compressed into Metal.",
  price: 1,
  usable: false,
  dependencies: [],
});
