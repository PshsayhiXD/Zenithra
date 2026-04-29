import {
  db as database,
  tables as tablesModule,
  dbTypes as databaseTypes_,
  config,
  formatter,
  number as numberUtility,
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
} from "@command/types/dependency";

export { resolveDependency } from "@command/dependency/resolver";

export * from "./core.js";
export * from "./deps/code.js";
export * from "./deps/guild.js";
export * from "./deps/pvp.js";
export * from "./deps/eventTracker.js";
export * from "./deps/items.js";
