import { defineItem } from "@modules/types/item.js";
import { EMOJIS } from "@configs/emojis.js";

export default defineItem({
  id: 9,
  name: "Wrench",
  category: "tool",
  icon: EMOJIS.wrench,
  rarity: "common",
  description: "A basic griefing tool.",
  price: 80,
  maxDurability: 20,
  dependencies: [],
});
