import type { Database } from "better-sqlite3";
import type * as tables from "@tables/index.js";
import type * as databaseTypes from "@tables/types/index.js";
import type { Components } from "@utilities/components/index.js";
import type { Config } from "@configs";
import type { number, currency } from "@utilities/index.js";
import type { code } from "@commands/dependency/deps/code.js";
import type { isGuildChannelType } from "@commands/dependency/deps/guild.js";
import type { pvpEvent } from "@commands/dependency/deps/pvp.js";
import type { eventTracker } from "@commands/dependency/deps/eventTracker.js";
import type { BaseItem } from "@modules/types/item.js";
import type { ItemId } from "@modules/items/_ids.js";
import type * as ItemModule from "@modules/items/index.js";
import type { Leaf } from "@commands/types/_leaf.js";
import type { DeepKeys, DeepValue } from "@commands/types/_deepKeys.js";
import type { UnpackModule } from "@dependency/deps/unpackModule.js";

export type { DeepKeys, DeepValue };

export interface DependenciesType {
  components: Components;
  db: Database;
  tables: typeof tables;
  dbTypes: typeof databaseTypes;
  env: typeof process.env;
  config: Config;
  code: typeof code;
  number: typeof number;
  isGuildChannelType: typeof isGuildChannelType;
  pvpEvent: typeof pvpEvent;
  eventTracker: typeof eventTracker;
  currency: typeof currency;
  commands: Record<number, unknown>;
  unpackModule: UnpackModule;
  module: {
    items: Map<string, BaseItem>;
    ItemId: typeof ItemId;
    item: Leaf<typeof ItemModule>;
  }
}

export type DependencyKey = DeepKeys<DependenciesType>;

export type ResolvedDeps<Keys extends DependencyKey> = {
  [K in Keys]: DeepValue<DependenciesType, K>;
};
