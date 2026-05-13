import type { WEEK_DAYS } from "@utilities/time.js";

export type WeekDay = (typeof WEEK_DAYS)[number];

export type PvpServer =
  | "persistent"
  | "ephemeral";

export const PvPServerEmoji: Record<PvpServer, string> = {
  ephemeral: "📅",
  persistent: "♾️",
};

export const PvPServerName: Record<PvpServer, string> = {
  ephemeral: "Ephemeral",
  persistent: "Persistent",
};

export interface PvpServerInfo {
  id: 1 | 2;
  type: PvpServer;
}

export interface ScrapedEntry {
  server: PvpServerInfo;
  dayText: string;
  timeText: string;
  countdownText: string;
}

export interface PvpEventResult {
  time: number;
  server: PvpServerInfo;
}

export type PvpQuery =
  | "all"
  | "today"
  | "tomorrow"
  | WeekDay
  | UpcomingKey
  | `past[${number}]`;

export const upcomingIndex = {
  next: 0,
  second: 1,
  third: 2,
  fourth: 3,
} as const;

export type UpcomingKey = keyof typeof upcomingIndex;
