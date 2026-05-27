import type { Leaf } from "@commands/types/_leaf.js";
/**
 * Type transformer.
 * @example
 * type Result = UnpackModuleType<Leaf<{ test: string }>>;
 * // -> { test: string }
*/
export type UnpackModuleType<T> =
  T extends Leaf<infer U> ? U : never;

/** Typing. */
export type UnpackModule =
  <T extends Leaf<unknown>>(value: T) => UnpackModuleType<T>;

/** Runtime. */
export const unpackModule: UnpackModule =
  value => value as UnpackModuleType<typeof value>;
