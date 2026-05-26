import { defineItem } from "@modules/types/item.js";
import { EMOJIS } from "@configs/emojis.js";

export default defineItem({
  id: 5,
  name: "Hyper Rubber",
  category: "resource",
  icon: EMOJIS.res_hyper_rubber,
  rarity: "none",
  description: "A very rare and bouncy currency. 100 can be compressed into Flux Crystals.",
  price: 10_000_000,
  usable: false,
  dependencies: ["code"],
});
