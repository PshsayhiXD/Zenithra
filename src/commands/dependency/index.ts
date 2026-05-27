import {
  db as database,
  tables as tablesModule,
  dbTypes as databaseTypes_,
  config,
  number as numberUtility,
  currency as currencyUtility,
  components,
} from "@dependency/core.js";
import type { Leaf } from "@commands/types/_leaf.js";
// dependencies
import { code } from "@dependency/deps/code.js";
import { isGuildChannelType } from "@dependency/deps/guild.js";
import { pvpEvent } from "@dependency/deps/pvp.js";
import { eventTracker } from "@dependency/deps/eventTracker.js";
import { legacyCommands } from "@dependency/deps/legacyCommands.js";
import { unpackModule } from "@dependency/deps/unpackModule.js";
import { items } from "@dependency/deps/items.js";
import { ItemId } from "@dependency/deps/itemId.js";
import { ItemModule } from "@dependency/deps/itemModule.js";

import type {
  DependenciesType,
} from "@commands/types/dependency.js";

export const availableDependencies: DependenciesType = {
  components,
  db: database,
  dbTypes: databaseTypes_,
  tables: tablesModule,
  env: { ...process.env },
  config,
  number: numberUtility,
  currency: currencyUtility,
  code,
  isGuildChannelType,
  pvpEvent,
  unpackModule,
  module: {
    items,
    item: ItemModule as unknown as Leaf<typeof ItemModule>,
    ItemId,
  },
  eventTracker,
  get commands() {
    return Object.fromEntries(legacyCommands.map((c) => [c.id, c]));
  },
};

export type {
  DeepKeys,
  DeepValue,
  ResolvedDeps,
  DependenciesType,
  DependencyKey,
} from "@commands/types/dependency.js";

export { resolveDependency } from "@dependency/resolver.js";
