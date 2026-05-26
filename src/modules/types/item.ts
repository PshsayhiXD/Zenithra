import type {
  CodeNumber,
} from "@dependencies";
import type {
  DependencyKey,
  ResolvedDeps,
} from "@commands/types/dependency.js";
export type ItemDependencyKey = DependencyKey;

export type ItemResult =
  | CodeNumber
  | [number, string];

export interface BaseItem {
  id: number;
  iconPath?: string;
  icon?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  usable?: boolean;
  durability?: number;
  maxDurability?: number;
  dependencies: ItemDependencyKey[];
  use?: ItemExecutor;
}

export interface ItemContext<T extends ItemDependencyKey = ItemDependencyKey> {
  userId: string;
  item: Item<T>;
  quantity?: number;
  args: string[];
  deps: ResolvedDeps<T>;
}

export type ItemExecutor<T extends ItemDependencyKey = ItemDependencyKey> = (
  context: ItemContext<T>
) => Promise<ItemResult>;

export interface Item<T extends ItemDependencyKey = ItemDependencyKey> extends Omit<BaseItem, "dependencies" | "use">{
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
} as const;

export type ItemCode = typeof ItemCode[keyof typeof ItemCode];
