import { MISSION } from "@config/mission.js";
import { missionStore } from "@handlers/missionTracker/store.js";
import type { FutureMission, MissionState } from "@handlers/missionTracker/type.js";

const normalize = (ts: number): number => ts > 1_000_000_000_000 ? Math.floor(ts / 1000) : ts;

export const getMissionState = (): MissionState => {
  const meta = missionStore.get();
  const open = MISSION.OPEN_DURATION;
  const close = MISSION.CLOSE_DURATION;
  const cycle = open + close;
  const base = normalize(MISSION.PERSISTENT_START_TS) + MISSION.OFFSET;
  const now = Math.floor(Date.now() / 1000);
  if (meta === null) {
    return {
      state: "CLOSED",
      timeLeft: 0,
      nextChange: now,
      missionName: null,
    };
  }
  const elapsed = (now - base) % cycle;
  const openState = elapsed < open;
  return {
    state: openState ? "OPEN" : "CLOSED",
    timeLeft: openState ? open - elapsed : cycle - elapsed,
    nextChange: now + (openState ? open - elapsed : cycle - elapsed),
    missionName: meta.mission,
  };
};

export const getFutureMissions = (count = 3): FutureMission[] => {
  const open = MISSION.OPEN_DURATION;
  const close = MISSION.CLOSE_DURATION;
  const cycle = open + close;
  const now = Math.floor(Date.now() / 1000);
  const base = normalize(MISSION.PERSISTENT_START_TS) + MISSION.OFFSET;
  const next = now < base ? base : base + Math.ceil((now - base) / cycle) * cycle;
  const out: FutureMission[] = [];
  for (let index = 0; index < count; index++) {
    const openTs = next + index * cycle;
    out.push({
      open: openTs,
      close: openTs + open,
    });
  }
  return out;
};

export const getMissionTrackerData = (count = 3): Promise<{ state: MissionState; futureMissions: FutureMission[] }> => {
  const state = getMissionState();
  const futureMissions = getFutureMissions(count);
  return Promise.resolve({ state, futureMissions });
};
