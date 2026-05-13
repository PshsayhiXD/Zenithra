import type { DeepKeys, DeepValue } from "@commands/types/dependency.js";

export const resolveDependency = <T extends object, P extends DeepKeys<T>>(
  object: T,
  path: P,
): DeepValue<T, P> => {
  const segments = (path as string).split(".");
  let current: unknown = object;
  for (const segment of segments) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) return undefined as DeepValue<T, P>;
    current = (current as Record<string, unknown>)[segment];
  }
  return current as DeepValue<T, P>;
}
