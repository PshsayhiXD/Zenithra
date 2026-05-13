import type { DependencyKey, ResolvedDeps } from "@commands/types/dependency.js";
import { availableDependencies } from "@commands/dependency/index.js";
import { resolveDependency } from "@commands/dependency/resolver.js";

export const getDeps = <const T extends DependencyKey>(
  dependencies?: T[],
): ResolvedDeps<T> => {
  const result = {} as ResolvedDeps<T>;
  for (const key of dependencies ?? []) {
    (result as Record<string, unknown>)[key as string] = resolveDependency(
      availableDependencies,
      key,
    );
  }

  return result;
};
