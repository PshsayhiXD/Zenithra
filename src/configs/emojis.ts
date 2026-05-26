export const EMOJIS = {
  res_flux_crystals:   "<:res_flux_crystals:1507222022806175754>",
  res_hyper_rubber:    "<:res_hyper_rubber:1507222025033224383>",
  res_silica_crystals: "<:res_silica_crystals:1507222029676445836>",
  comp_metal:          "<:comp_metal:1507222014560043120>",
  comp_exp:            "<:comp_exp:1507222012496580698>",
  res_metal:           "<:res_metal:1507222027646537858>",
  res_explosives:      "<:res_explosives:1507222021141168131>",
  elim_loot_box:       "<:loot_box:1507222016732692610>",
  elim_loot_box_locked:"<:loot_box_locked:1507222019358457886>"
} as const;

export type EmojiKey = keyof typeof EMOJIS;
