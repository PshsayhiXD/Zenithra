export type MissionServer = "persistent" | "wipe" | "test";

export interface MissionData {
  mission: string;
  location: string;
  startTime: number;
  setAt: number;
}

export interface MissionStoreData {
  servers: Partial<Record<MissionServer, MissionData>>;
  version: number;
}

export interface MissionState {
  state: "OPEN" | "CLOSED";
  timeLeft: number;
  nextChange: number;
  missionName: string | null;
}

export interface FutureMission {
  server: MissionServer;
  open: number;
  close: number;
}

export interface MissionTrackerData {
  state: MissionState;
  futureMissions: FutureMission[];
  trackedServers: Partial<Record<MissionServer, MissionData>>;
}
