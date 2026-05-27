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
