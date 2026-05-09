import type {
  CodeNumber,
} from "@dependencies";
import type { code } from "@/command/dependency/deps/code.js";
import type * as tables from "@tables/index.js";

export type ItemResult = CodeNumber | [number, string];

export interface ItemDependencyMap {
  code: typeof code;
  tables: typeof tables;
}

export type ItemDependencyKey = keyof ItemDependencyMap;

export type ItemExecutor<T extends ItemDependencyKey = ItemDependencyKey> = (
  context: ItemContext<T>
) => Promise<ItemResult>;

export interface ItemContext<T extends ItemDependencyKey = ItemDependencyKey> {
  userId: string;
  item: Item<T>;
  quantity?: number;
  args: string[];
  deps: Pick<ItemDependencyMap, T>;
}

export interface Item<T extends ItemDependencyKey = ItemDependencyKey> {
  id: number;
  iconPath?: string;
  icon?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  usable?: boolean;
  durability?: number | undefined;
  maxDurability?: number | undefined;
  dependencies: T[];
  use?: ItemExecutor<T> | undefined;
}

export interface ItemDefinition<T extends ItemDependencyKey = ItemDependencyKey>
  extends Partial<Omit<Item<T>, "use">> {
  execute?: ItemExecutor<T> | undefined;
}

export const ItemCode = {
  success: 1,
  notEnough: 2,
  notFound: 3,
  cannotUse: 4,
  broken: 5,
} as const;

export type ItemCode = typeof ItemCode[keyof typeof ItemCode];
