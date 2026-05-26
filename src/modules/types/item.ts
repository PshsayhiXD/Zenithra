import type { CodeNumber } from "@dependencies";
import type { DependencyKey, ResolvedDeps } from "@commands/types/dependency.js";
import type { RarityKey } from "@configs/rarities.js";

export const RepairCode = {
  success: 1,
  notFound: 2,
  notRepairable: 3,
  alreadyFull: 4,
  missingMaterial: 5,
  invalidRecipe: 6,
} as const;

export type RepairResult =
  | typeof RepairCode[keyof typeof RepairCode]
  | [typeof RepairCode[keyof typeof RepairCode], string];

/** [itemId, quantity, repairAmount] */
export type RepairMaterial = [string, number, number];

/** A group of material options — player picks one from this group. */
export type RepairGroup = RepairMaterial[];

/** Full repair cost — one item must be chosen from each group. */
export type RepairCost = RepairGroup[];

export type ItemDependencyKey = DependencyKey;

export type ItemResult =
  | CodeNumber
  | [number, string];

export type ItemTargetType = "self" | "item" | "player" | "event";

export interface BaseItem {
  /** Unique numeric ID. 0 means unregistered. */
  id: number;
  /** Path to the icon file. */
  iconPath?: string;
  /** Icon identifier (e.g. emoji or asset key). */
  icon?: string;
  name: string;
  category: string;
  description: string;
  /**
   * Repair cost for this item.
   * Outer array: each entry is a required material group - one item must be chosen from each group.
   * Inner array: the options within that group (player picks one).
   * Each option: [itemId, quantity, repairAmount].
   *
   * @example
   * repairCost: [
   *   [["comp_iron", 2, 10], ["comp_metal", 2, 10]],  // group 1: pick comp_iron OR comp_metal
   *   [["res_flux_crystals", 1, 50]],                  // group 2: must use flux (only option)
   * ]
   */
  repairCost?: RepairCost;
  /** Base buy price. */
  price: number;
  /** Whether the item can be used via the use command. */
  usable?: boolean;
  /** Current durability. Decremented by 1 per use. Item is removed when it reaches 0. */
  durability?: number;
  /** Maximum durability. Required for durability to function. */
  maxDurability?: number;
  /** Fixed number of uses. Unlike durability, charges cannot be repaired. */
  charges?: number;
  /** [min, max] durability restored when this item is used as a repair tool. */
  repairAmount?: [number, number];
  /** Cooldown in seconds between uses. */
  cooldown?: number;
  rarity: RarityKey;
  /** Inventory weight units consumed. */
  weight?: number;
  /** What this item targets when used. Affects how `args` is interpreted in the executor. */
  targetType?: ItemTargetType;
  /** Whether this item can be produced via the crafting system. */
  craftable?: boolean;
  /** Item keys required to craft this item. */
  ingredients?: string[];
  /** Whether this item can be broken down into parts. */
  salvageable?: boolean;
  /** Items yielded when this item is salvaged. Each entry is [itemId, minQuantity, maxQuantity]. */
  salvageYield?: [string, number, number][];
  dependencies: ItemDependencyKey[];
  use?: ItemExecutor;
}

/** Runtime context passed to an item's executor when it is used. */
export interface ItemContext<T extends ItemDependencyKey = ItemDependencyKey> {
  userId: string;
  item: Item<T>;
  /** Number of the item being used. Defaults to 1. */
  quantity?: number;
  /** Resolved targets. Empty for "self", item/player keys for others. */
  onTarget: string[];
  /** Extra arguments passed by the user e.g. quantity, options. */
  args: string[];
  /** Resolved dependencies declared by the item. */
  deps: ResolvedDeps<T>;
}

/** Result of item execution. */
export type ItemExecutor<T extends ItemDependencyKey = ItemDependencyKey> = (
  context: ItemContext<T>
) => Promise<ItemResult>;

/** Full item definition. */
export interface Item<T extends ItemDependencyKey = ItemDependencyKey> extends Omit<BaseItem, "dependencies" | "use"> {
  dependencies: T[];
  use?: ItemExecutor<T>;
}

export const defineItem = <T extends ItemDependencyKey>(
  item: Item<T>
): Item<T> => item;

export const ItemCode = {
  success: 1,
  notEnough: 2,
  notFound: 3,
  cannotUse: 4,
  broken: 5,
  selectSlot: 6,
} as const;

export type ItemCode = typeof ItemCode[keyof typeof ItemCode];
