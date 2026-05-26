import type { CodeNumber } from "@dependencies";
import type { DependencyKey, ResolvedDeps } from "@commands/types/dependency.js";
import type { RarityKey } from "@configs/rarities.js";

export type ItemDependencyKey = DependencyKey;

export type ItemResult =
  | CodeNumber
  | [number, string];

export type ItemTargetType = "self" | "item" | "player";

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

export type ItemExecutor<T extends ItemDependencyKey = ItemDependencyKey> = (
  context: ItemContext<T>
) => Promise<ItemResult>;

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
