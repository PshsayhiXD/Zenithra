import {
  db as database,
  tables as tablesModule,
  dbTypes as databaseTypes_,
  config,
  formatter,
  number as numberUtility,
  currency as currencyUtility,
  createEmbed,
} from "@dependency/core.js";
import { code } from "@/command/dependency/deps/code.js";
import { isGuildChannelType } from "@/command/dependency/deps/guild.js";
import { pvpEvent } from "@/command/dependency/deps/pvp.js";
import { eventTracker } from "@/command/dependency/deps/eventTracker.js";
import { items } from "@/command/dependency/deps/items.js";

import type {
  StaticDependencies,
  DependencyKey,
  DeepValue,
} from "@command/types/dependency.js";
import { resolveDependency } from "@command/dependency/resolver.js";

export const availableDependencies: StaticDependencies = {
  createEmbed,
  db: database,
  dbTypes: databaseTypes_,
  tables: tablesModule,
  env: { ...process.env },
  formatter,
  config,
  number: numberUtility,
  currency: currencyUtility,
  code,
  isGuildChannelType,
  pvpEvent,
  eventTracker,
  items,
};

export const getDependency = <K extends DependencyKey>(
  key: K,
): DeepValue<StaticDependencies, K> => resolveDependency(availableDependencies, key);

export type {
  DeepKeys,
  DeepValue,
  ResolvedDeps,
  CommandDependencies,
  StaticDependencies,
  DependencyKey,
} from "@command/types/dependency.js";

export { resolveDependency } from "@dependency/resolver.js";

export * from "@dependency/core.js";
export * from "@dependency/deps/code.js";
export * from "@dependency/deps/guild.js";
export * from "@dependency/deps/pvp.js";
export * from "@dependency/deps/eventTracker.js";
export * from "@dependency/deps/items.js";
