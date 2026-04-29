import { Cache } from "@utilities/cache.js";
import type { MissionData } from "@handlers/missionTracker/type.js";

const cache = new Cache<MissionData>("mission", "file");
const KEY = "current";

export const missionStore = {
  set: (data: MissionData): void => {
    const current = cache.get(KEY);
    const nextVersion =
      typeof current?.version === "number" ? current.version + 1 : 1;
    cache.set(KEY, {
      ...data,
      version: nextVersion
    }, 10 * 60 * 1000);
  },

  get: (): MissionData | null => cache.get(KEY) ?? null,

  onChange: (callback: (data: MissionData) => void): void => {
    cache.onChange(KEY, callback);
    const current = cache.get(KEY);
    if (current) callback(current);
  },

  clear: (): void => {
    cache.delete(KEY);
  }
};
