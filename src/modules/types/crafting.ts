/** [itemId, quantity], one ingredient option */
export type IngredientOption = [string, number];

/** A group of ingredient options, player picks one from this group. */
export type IngredientGroup = IngredientOption[];

/** Full ingredient list, one item must be chosen from each group. */
export type Ingredients = IngredientGroup[];

export const CraftCode = {
  success: 1,
  notFound: 2,
  notCraftable: 3,
  missingIngredient: 4,
  invalidIngredient: 5,
} as const;

export type CraftResult =
  | typeof CraftCode[keyof typeof CraftCode]
  | [typeof CraftCode[keyof typeof CraftCode], string];

// another one from crafting/getCraftCost.ts
// couldnt include here because of circular import
