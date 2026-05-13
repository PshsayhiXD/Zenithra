import { MISSION } from "@configs/mission.js";
import { missionStore } from "@handlers/missionTracker/store.js";
import type { FutureMission, MissionState } from "@handlers/missionTracker/type.js";

const normalize = (ts: number): number => ts > 1_000_000_000_000 ? Math.floor(ts / 1000) : ts;

/**
 * Compute the cycle base timestamp in seconds.
 * Uses the interstellar store when available, otherwise falls back to
 * the persistent config timestamp.
 */
const computeBase = (): number => {
  const meta = missionStore.get();
  if (MISSION.TRACKER.USE_INTERSTELLAR && meta?.startTime !== undefined) {
    return normalize(meta.startTime);
  }
  return normalize(MISSION.PERSISTENT_START_TS) + MISSION.OFFSET;
};

export const getMissionState = (): MissionState => {
  const meta = missionStore.get();

  if (meta === null) {
    const now = Math.floor(Date.now() / 1000);
    return {
      state: "CLOSED",
      timeLeft: 0,
      nextChange: now,
      missionName: null,
    };
  }

  const open = MISSION.OPEN_DURATION;
  const close = MISSION.CLOSE_DURATION;
  const cycle = open + close;
  const now = Math.floor(Date.now() / 1000);
  const base = computeBase();
  const elapsed = (now - base) % cycle;
  const isOpen = elapsed < open;

  return {
    state: isOpen ? "OPEN" : "CLOSED",
    timeLeft: isOpen ? open - elapsed : cycle - elapsed,
    nextChange: now + (isOpen ? open - elapsed : cycle - elapsed),
    missionName: isOpen ? meta.mission : null,
  };
};

export const getFutureMissions = (count = 3): FutureMission[] => {
  const open = MISSION.OPEN_DURATION;
  const close = MISSION.CLOSE_DURATION;
  const cycle = open + close;
  const now = Math.floor(Date.now() / 1000);
  const base = computeBase();

  const next = now < base ? base : base + Math.ceil((now - base) / cycle) * cycle;
  const out: FutureMission[] = [];
  for (let index = 0; index < count; index++) {
    const openTs = next + index * cycle;
    out.push({ open: openTs, close: openTs + open });
  }
  return out;
};

export const getMissionTrackerData = (count = 3): { state: MissionState; futureMissions: FutureMission[] } => ({
    state: getMissionState(),
    futureMissions: getFutureMissions(count),
  });
