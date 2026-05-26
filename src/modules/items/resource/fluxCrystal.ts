import { defineItem } from "@modules/types/item.js";
import { EMOJIS } from "@configs/emojis.js";

export default defineItem({
  id: 4,
  name: "Flux Crystal",
  category: "resource",
  icon: EMOJIS.res_flux_crystals,
  rarity: "none",
  description: "The rarest currency in the universe.",
  price: 1_000_000_000,
  usable: false,
  dependencies: [],
});
