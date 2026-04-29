import type { Message, EmbedBuilder } from "discord.js";
import type { Database } from "better-sqlite3";
import type { CreateEmbedOptions } from "@utilities/ui/types/embed.js";
import type * as tables from "@tables/index.js";
import type * as databaseTypes from "@tables/types/index.js";

import { type Config } from "@config";
import type { formatter, number } from "@utilities/index.js";
import type { code } from "@/command/dependency/deps/code.js";
import type { isGuildChannelType } from "@/command/dependency/deps/guild.js";
import type { pvpEvent } from "@/command/dependency/deps/pvp.js";
import type { eventTracker } from "@/command/dependency/deps/eventTracker.js";
import type { items } from "@/command/dependency/deps/items.js";

export type DeepKeys<T> = {
  [K in keyof T & string]: T[K] extends (...arguments_: never[]) => unknown
    ? K
    : T[K] extends readonly unknown[]
      ? K
      : T[K] extends object
        ? K | `${K}.${DeepKeys<T[K]>}`
        : K;
}[keyof T & string];

export type DeepValue<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? DeepValue<T[K], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

export interface CommandDependencies {
  createEmbed: (options: CreateEmbedOptions) => EmbedBuilder;
  db: Database;
  tables: typeof tables;
  dbTypes: typeof databaseTypes;
  env: typeof process.env;
  formatter: typeof formatter;
  config: Config;
  code: typeof code;
  number: typeof number;
  isGuildChannelType: typeof isGuildChannelType;
  pvpEvent: typeof pvpEvent;
  eventTracker: typeof eventTracker;
  items: typeof items;
  message: Message;
}

export type StaticDependencies = Omit<CommandDependencies, "message">;

export type DependencyKey = DeepKeys<StaticDependencies>;

export type ResolvedDeps<Keys extends DependencyKey> = {
  [K in Keys]: DeepValue<StaticDependencies, K>;
};
