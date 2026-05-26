export interface Rarity {
  key: string;
  label: string;
  color: string;
  weight: number;
}

export const RARITIES = {
  none:      { key: "none",      label: "None",      color: "#0f0f0f", weight: 0   },
  common:    { key: "common",    label: "Common",    color: "#b0b0b0", weight: 100 },
  uncommon:  { key: "uncommon",  label: "Uncommon",  color: "#4caf50", weight: 60  },
  rare:      { key: "rare",      label: "Rare",      color: "#2196f3", weight: 30  },
  epic:      { key: "epic",      label: "Epic",      color: "#9c27b0", weight: 10  },
  legendary: { key: "legendary", label: "Legendary", color: "#ff9800", weight: 3   },
} as const satisfies Record<string, Rarity>;

export type RarityKey = keyof typeof RARITIES;
