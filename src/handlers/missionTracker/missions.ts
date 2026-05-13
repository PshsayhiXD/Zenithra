import { MISSION } from "@configs/mission.js";
import { missionStore } from "@handlers/missionTracker/store.js";
import type {
  FutureMission,
  MissionState,
  MissionTrackerData,
} from "@handlers/missionTracker/type.js";

const MAX_FUTURE_MISSIONS = 5;

const normalize = (ts: number): number =>
  ts > 1_000_000_000_000 ? Math.floor(ts / 1000) : ts;

const computeBase = (): number => {
  const persistent = missionStore.getServer("persistent");
  if (
    MISSION.TRACKER.USE_INTERSTELLAR &&
    persistent?.startTime !== undefined
  ) {
    return normalize(persistent.startTime);
  }
  return normalize(MISSION.PERSISTENT_START_TS) + MISSION.OFFSET;
};

export const getMissionState = (): MissionState => {
  const meta = missionStore.getServer("persistent");
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
    missionName: isOpen ? meta?.mission ?? null : null,
  };
};

export const getFutureMissions = (count = 3): FutureMission[] => {
  const safeCount = Math.max(0, Math.min(count, MAX_FUTURE_MISSIONS));
  const open = MISSION.OPEN_DURATION;
  const close = MISSION.CLOSE_DURATION;
  const cycle = open + close;
  const now = Math.floor(Date.now() / 1000);
  const base = computeBase();

  const next =
    now < base ? base : base + Math.ceil((now - base) / cycle) * cycle;
  const out: FutureMission[] = [];
  for (let index = 0; index < safeCount; index++) {
    const openTs = next + index * cycle;
    out.push({ server: "persistent", open: openTs, close: openTs + open });
  }
  return out;
};

export const getMissionTrackerData = (count = 3): MissionTrackerData => {
  const storeData = missionStore.get();
  const trackedServers = storeData === null ? {} : storeData.servers;

  return {
    state: getMissionState(),
    futureMissions: getFutureMissions(count),
    trackedServers,
  };
};
