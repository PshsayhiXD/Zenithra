import {
  type ScrapedEntry,
  type WeekDay,
  type UpcomingKey,
  upcomingIndex
} from "@handlers/pvpEventTracker/type.js";

import { time } from "@utilities/index.js";

let schedule: ScrapedEntry[] = [];

const normalizeQuery = (raw: unknown): string => {
  if (Array.isArray(raw)) return raw.join(" ").toLowerCase();
  if (typeof raw === "object" && raw !== null) return JSON.stringify(raw).toLowerCase();
  return String(raw).toLowerCase();
};
const isUpcomingQuery = (q: string): q is UpcomingKey => q in upcomingIndex;
const getUpcoming = <T>(
  array: T[],
  getTime: (v: T) => number,
  now: number,
): T[] => array
  .filter((v: T): boolean => getTime(v) > now)
  .sort((a: T, b: T): number => getTime(a) - getTime(b));
const filterToday = <T>(array: T[], getDate: (v: T) => Date): T[] => {
  const t = new Date().setHours(0, 0, 0, 0);
  return array.filter((v: T): boolean => getDate(v).setHours(0, 0, 0, 0) === t);
};
const filterWeekday = <T>(array: T[], getDate: (v: T) => Date, q: string): T[] => {
  const index = time.WEEK_DAYS.indexOf(q as WeekDay);
  return array.filter((v: T): boolean => getDate(v).getDay() === index);
};
const fetchSchedule = async (): Promise<void> => {
  try {
    const r = await fetch("https://drednot.io/pvp-events", {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) throw new Error("Failed to fetch PvP events schedule");
    const b = await r.text();
    const s = b
      .match(/<script[^>]*>(.*?)<\/script>/g)
      ?.find((v: string): boolean => v.includes("SCHEDULE="));
    if (s === undefined) throw new Error("Failed to find schedule script");
    const index = s
      .replaceAll(/<script[^>]*>|<\/script>/g, "")
      .trim()
      .replace("SCHEDULE=", "");
    const parsed: unknown = JSON.parse(index);
    if (!Array.isArray(parsed)) throw new Error("Failed to parse schedule");
    schedule = parsed as ScrapedEntry[];
  } catch {
    schedule = [];
  }
};

const scrapPvpEvent = async (rawQuery: unknown): Promise<string | string[] | Error> => {
  await fetchSchedule();
  const q = normalizeQuery(rawQuery);
  const now = Date.now();
  if (q === "all") return schedule.map((v) => v.date);
  if (q === "today") {
    const result = filterToday(schedule, (v) => new Date(v.date));
    return result.length > 0 ? result.map((v) => v.date) : new Error("No events today.");
  }
  if (isUpcomingQuery(q)) {
    const upcoming = getUpcoming(schedule, (v) => new Date(v.date).getTime(), now);
    const event = upcoming.at(upcomingIndex[q]);
    if (event === undefined) return new Error("No upcoming events.");
    return event.date;
  }
  if (time.WEEK_DAYS.includes(q as WeekDay)) {
    const result = filterWeekday(schedule, (v) => new Date(v.date), q);
    return result.length > 0 ? result.map((v) => v.date) : new Error(`No events on ${q}.`);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(q) < today) return new Error("Cannot query past events.");
  const result = schedule.filter((v) => v.date === q);
  return result.length > 0 ? result.map((v) => v.date) : new Error(`No events on ${q}.`);
};

interface ScheduleCalc { day: number; hour: number; minute: number }
const calcSchedule: ScheduleCalc[] = [
  { day: 0, hour: 2, minute: 0 },
  { day: 1, hour: 0, minute: 0 },
  { day: 3, hour: 6, minute: 0 },
  { day: 4, hour: 23, minute: 0 },
];

const buildDate = (base: Date, event: ScheduleCalc): number => {
  const d = new Date(base);
  const diff = (event.day - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  d.setHours(event.hour, event.minute, 0, 0);
  let t = d.getTime();
  if (t <= Date.now()) t += time.WEEK;
  return t;
};

const calcPvpEvent = (rawQuery: unknown): number[] | number => {
  const q = normalizeQuery(rawQuery);
  const now = Date.now();
  const base = new Date(now);
  const all = calcSchedule
    .flatMap((event) =>
      Array.from(
        { length: 5 },
        (_, index) => buildDate(base, event) + (index - 2) * time.WEEK,
      ),
    )
    .sort((a, b) => a - b);
  if (isUpcomingQuery(q)) {
    const f = all.filter((t: number): boolean => t > now);
    return f[upcomingIndex[q]] ?? 0;
  }
  const past = /^past\[(\d+)]$/.exec(q);
  if (past !== null) {
    const p = all.filter((t) => t < now).reverse();
    return p[Number(past[1])] ?? 0;
  }
  if (q === "all") return all;
  if (q === "today") {
    const d = new Date(now).getDay();
    return all.filter((t) => new Date(t).getDay() === d);
  }
  if (time.WEEK_DAYS.includes(q as WeekDay)) {
    const index = time.WEEK_DAYS.indexOf(q as WeekDay);
    return all.filter((t) => new Date(t).getDay() === index);
  }
  throw new Error("Invalid query.");
};

export {
  scrapPvpEvent,
  calcPvpEvent
};
