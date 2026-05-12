export interface MissionData {
  mission: string;
  location: string;
  startTime: number;
  setAt: number;
  version: number;
}

export interface MissionState {
  state: "OPEN" | "CLOSED";
  timeLeft: number;
  nextChange: number;
  missionName: string | null;
}

export interface FutureMission {
  open: number;
  close: number;
}
