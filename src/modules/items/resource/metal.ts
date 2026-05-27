import { defineItem } from "@modules/types/item.js";
import { EMOJIS } from "@configs/emojis.js";

export default defineItem({
  id: 7,
  name: "Metal",
  category: "resource",
  icon: EMOJIS.res_metal,
  rarity: "none",
  description: "A solid currency. 10 can be compressed into Compressed Explosives.",
  price: 10,
  usable: false,
  craftable: false,
  dependencies: [],
});
