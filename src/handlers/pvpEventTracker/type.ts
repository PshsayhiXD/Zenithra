import type { WEEK_DAYS } from "@utilities/time.js";

export type WeekDay = (typeof WEEK_DAYS)[number];

export type PvpServer =
  | "persistent"
  | "ephemeral";

export interface ScrapedEntry {
  server: {
    id: 1 | 2;
    type: PvpServer;
  };
  dayText: string;
  timeText: string;
  countdownText: string;
}

export interface PvpEventResult {
  time: number;
  server: {
    id: 1 | 2;
    type: PvpServer;
  };
}

export const upcomingIndex = {
  next: 0,
  second: 1,
  third: 2,
  fourth: 3,
} as const;

export type UpcomingKey = keyof typeof upcomingIndex;
