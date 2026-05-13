import { Cache } from "@utilities/cache.js";
import type {
  MissionData,
  MissionServer,
  MissionStoreData,
} from "@handlers/missionTracker/type.js";

const MISSION_TTL_MS = 10 * 60 * 1000;

const cache = new Cache<MissionStoreData>("mission", "file");
const KEY = "current";

export const missionStore = {
  setServers: (servers: Partial<Record<MissionServer, MissionData>>): void => {
    const current = cache.get(KEY);
    const nextVersion =
      typeof current?.version === "number" ? current.version + 1 : 1;
    cache.set(KEY, { servers, version: nextVersion }, MISSION_TTL_MS);
  },

  get: (): MissionStoreData | null => cache.get(KEY) ?? null,

  getServer: (server: MissionServer): MissionData | null =>
    cache.get(KEY)?.servers[server] ?? null,

  /**
   * Subscribe to future mission data changes.
   * The callback is NOT fired immediately on subscribe - call `get()` first
   * if you need the current value right away.
   *
   * Returns an unsubscribe function.
   */
  onChange: (callback: (data: MissionStoreData) => void): (() => void) =>
    cache.onChange(KEY, callback),

  clear: (): void => {
    cache.delete(KEY);
  },
};
