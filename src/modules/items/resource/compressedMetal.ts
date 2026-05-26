import { defineItem } from "@modules/types/item.js";
import { EMOJIS } from "@configs/emojis.js";

export default defineItem({
  id: 2,
  name: "Compressed Metal",
  category: "resource",
  icon: EMOJIS.comp_metal,
  rarity: "none",
  description: "10 Compressed Explosives compressed together. 100 can be compressed into Silica Crystals.",
  price: 1000,
  usable: false,
  dependencies: [],
});
