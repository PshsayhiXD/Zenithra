import type { DependencyKey, ResolvedDeps } from "@command/types/dependency.js";
import { availableDependencies } from "@command/dependency/index.js";
import { resolveDependency } from "@command/dependency/resolver.js";

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
