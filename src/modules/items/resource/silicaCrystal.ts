import { defineItem } from "@modules/types/item.js";
import { EMOJIS } from "@configs/emojis.js";

export default defineItem({
  id: 8,
  name: "Silica Crystal",
  category: "resource",
  icon: EMOJIS.res_silica_crystals,
  rarity: "none",
  description: "A rare and shiny currency. 100 can be compressed into Hyper Rubber.",
  price: 100_000,
  usable: false,
  dependencies: ["code"],
});
