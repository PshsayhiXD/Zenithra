import type { Message } from "discord.js";
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

type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

type Previous = [never, 0, 1, 2, 3, 4, 5];

type IsPlainObject<T> =
  T extends Primitive ? false
  : T extends (...arguments_: never[]) => unknown ? false
  : T extends readonly unknown[] ? false
  : T extends object ? true
  : false;

export type DeepKeys<
  T,
  D extends number = 5,
  Seen = never
> =
  [D] extends [never]
    ? never
    : T extends Seen
      ? never
      : {
          [K in keyof T & string]:
            IsPlainObject<T[K]> extends true
              ? K | `${K}.${DeepKeys<T[K], Previous[D], Seen | T>}`
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
  message: Message;
}

export type DependencyKey = DeepKeys<Omit<CommandDependencies, "message">>;

export type ResolvedDeps<Keys extends DependencyKey> = {
  [K in Keys]: DeepValue<Omit<CommandDependencies, "message">, K>;
};
