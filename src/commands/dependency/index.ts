import {
  db as database,
  tables as tablesModule,
  dbTypes as databaseTypes_,
  config,
  number as numberUtility,
  currency as currencyUtility,
  components,
} from "@dependency/core.js";
import { code } from "@commands/dependency/deps/code.js";
import { isGuildChannelType } from "@commands/dependency/deps/guild.js";
import { pvpEvent } from "@commands/dependency/deps/pvp.js";
import { eventTracker } from "@commands/dependency/deps/eventTracker.js";
import { legacyCommands } from "@commands/_legacyCommands.js";

import type {
  CommandDependencies,
  DependencyKey,
  DeepValue,
} from "@commands/types/dependency.js";
import { resolveDependency } from "@commands/dependency/resolver.js";

export const availableDependencies: Omit<CommandDependencies, "message"> = {
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
  eventTracker,
  get commands() {
    return Object.fromEntries(legacyCommands.map((c) => [c.id, c]));
  },
};

export const getDependency = <K extends DependencyKey>(
  key: K,
): DeepValue<Omit<CommandDependencies, "message">, K> => resolveDependency(availableDependencies, key);

export type {
  DeepKeys,
  DeepValue,
  ResolvedDeps,
  CommandDependencies,
  DependencyKey,
} from "@commands/types/dependency.js";

export { resolveDependency } from "@dependency/resolver.js";

export * from "@dependency/core.js";
export * from "@dependency/deps/code.js";
export * from "@dependency/deps/guild.js";
export * from "@dependency/deps/pvp.js";
export * from "@dependency/deps/eventTracker.js";
export * from "@dependency/deps/items.js";
