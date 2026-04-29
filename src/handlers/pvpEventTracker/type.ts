import type { time } from "@utilities/index.js";

export type WeekDay = (typeof time.WEEK_DAYS)[number];

export interface ScrapedEntry { date: string }
export interface ScheduleEntry { date: string | number | (string | number)[] }

export interface ScheduleCalc { day: number; hour: number; minute: number }

export const upcomingIndex = {
  next: 0,
  second: 1,
  third: 2,
  fourth: 3,
} as const;

export type UpcomingKey = keyof typeof upcomingIndex;

export type ScrapQuery = string;

export type CalcQuery = string;

export type ScrapResult = string[] | string | Error;

export type CalcResult = number[] | number;
