import { Cache } from "@utilities/cache.js";
import type { MissionData } from "@handlers/missionTracker/type.js";

const MISSION_TTL_MS = 10 * 60 * 1000;

const cache = new Cache<MissionData>("mission", "file");
const KEY = "current";

export const missionStore = {
  set: (data: MissionData): void => {
    const current = cache.get(KEY);
    const nextVersion =
      typeof current?.version === "number" ? current.version + 1 : 1;
    cache.set(KEY, { ...data, version: nextVersion }, MISSION_TTL_MS);
  },

  get: (): MissionData | null => cache.get(KEY) ?? null,

  /**
   * Subscribe to future mission data changes.
   * The callback is NOT fired immediately on subscribe - call `get()` first
   * if you need the current value right away.
   *
   * Returns an unsubscribe function.
   */
  onChange: (callback: (data: MissionData) => void): (() => void) =>
    cache.onChange(KEY, callback),

  clear: (): void => {
    cache.delete(KEY);
  },
};
