import {
  type ScrapedEntry,
  type WeekDay,
  type UpcomingKey,
  type PvpEventResult,
  type PvpServer,
  type PvpQuery,
  upcomingIndex,
} from "@handlers/pvpEventTracker/type.js";
import { Cache } from "@utilities/cache.js";
import { createLogger } from "@utilities/logger.js";
import { WEEK_DAYS, WEEK, HOUR } from "@utilities/time.js";

const log = createLogger("PvpEventTracker");
const SCHEDULE_TTL_MS = HOUR;
const scheduleCache = new Cache<ScrapedEntry[]>("pvpSchedule", "memory");
const SCHEDULE_CACHE_KEY = "schedule";
interface FixedEntry {
  time: string;
  server: {
    id: 1 | 2;
    type: PvpServer;
  };
};

const fixedSchedule: readonly FixedEntry[] = [
  {
    time: "2026-05-14T05:00:00+07:00",
    server: {
      id: 1,
      type: "persistent",
    },
  },
  {
    time: "2026-05-15T07:00:00+07:00",
    server: {
      id: 1,
      type: "persistent",
    },
  },
  {
    time: "2026-05-16T09:00:00+07:00",
    server: {
      id: 2,
      type: "ephemeral",
    },
  },
  {
    time: "2026-05-16T23:00:00+07:00",
    server: {
      id: 1,
      type: "persistent",
    },
  },
  {
    time: "2026-05-17T02:00:00+07:00",
    server: {
      id: 2,
      type: "ephemeral",
    },
  },
  {
    time: "2026-05-17T13:00:00+07:00",
    server: {
      id: 1,
      type: "persistent",
    },
  },
  {
    time: "2026-05-18T00:00:00+07:00",
    server: {
      id: 1,
      type: "persistent",
    },
  },
] as const;

const normalizeQuery = (raw: PvpQuery): string => raw.trim().toLowerCase();

const isUpcomingQuery = (q: string): q is UpcomingKey => q in upcomingIndex;

const parseCountdown = (value: string): number => {
  const parts = value.split(":").map(Number);
  if (parts.length !== 3 || parts.some(element => Number.isNaN(element))) throw new Error(`Invalid countdown: "${value}"`);
  const [totalHours, minutes, seconds] = parts;
  if (totalHours === undefined || minutes === undefined || seconds === undefined) throw new Error(`Invalid countdown: "${value}"`);
  return (totalHours * 60 * 60 + minutes * 60 + seconds) * 1000;
};

const buildOccurrences = (entry: FixedEntry, now: number): PvpEventResult[] => {
  const first = new Date(entry.time).getTime();
  if (Number.isNaN(first)) return [];
  const passed = Math.floor((now - first) / WEEK);
  const start = Math.max(0, passed - 7);
  return Array.from({ length: 30 }, (_, index): PvpEventResult => ({
    time: first + (start + index) * WEEK,
    server: entry.server,
  }));
};

const parseScheduleTable = (html: string): ScrapedEntry[] => {
  const table = html.match(/<table[^>]*id="pvp-schedule"[^>]*>[\S\s]*?<\/table>/i)?.[0];
  if (table === undefined) throw new Error("PvP schedule table not found.");
  const rows = [...table.matchAll(/<tr[^>]*>([\S\s]*?)<\/tr>/gi)]
    .map(match => match[1] ?? "")
    .filter(row => /<td/i.test(row));
  return rows.map((rowHtml): ScrapedEntry => {
    const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\S\s]*?)<\/t[dh]>/gi)].map(match => (match[1] ?? "").replace(/<[^>]*>/g, "").replaceAll("&nbsp;", " ").replace(/\s+/g, " ").trim());
    if (cells.length < 4) throw new Error("Invalid PvP schedule row.");
    const [serverText, dayText, timeText, countdownText] = cells as [string, string, string, string];
    const serverMatch = /(persistent|ephemeral).*server\s*(\d)/i.exec(serverText);
    if (serverMatch === null) throw new Error(`Invalid server: "${serverText}"`);
    const [, rawType, rawId] = serverMatch;
    if (rawType === undefined || rawId === undefined) throw new Error(`Invalid server: "${serverText}"`);
    const id = Number(rawId);
    if (id !== 1 && id !== 2) throw new Error(`Invalid server id: "${rawId}"`);
    return {
      server: {
        id,
        type: rawType.toLowerCase() as PvpServer,
      },
      dayText,
      timeText,
      countdownText,
    };
  });
};

const fetchSchedule = async (): Promise<ScrapedEntry[]> => {
  const cached = scheduleCache.get(SCHEDULE_CACHE_KEY);
  if (cached !== undefined) return cached;
  try {
    const response = await fetch("https://drednot.io/pvp-events/", {
      headers: {
        Accept: "text/html",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${String(response.status)}: Failed to fetch PvP events`);
    const body = await response.text();
    const schedule = parseScheduleTable(body);
    scheduleCache.set(SCHEDULE_CACHE_KEY, schedule, SCHEDULE_TTL_MS);
    log.debug("pvpSchedule.fetched", {
      count: schedule.length,
    });
    return schedule;
  } catch (error: unknown) {
    const error_ = error instanceof Error ? error : new Error(String(error));
    log.error(error_, {
      phase: "fetchSchedule",
    });
    return [];
  }
};

const formatEntry = (entry: ScrapedEntry): string => `${entry.dayText} ${entry.timeText} (${entry.server.type} Server ${String(entry.server.id)})`;

export const scrapPvpEvent = async (rawQuery: PvpQuery): Promise<string | string[] | Error> => {
  const schedule = await fetchSchedule();
  const q = normalizeQuery(rawQuery);
  if (q === "all") return schedule.map((entry): string => formatEntry(entry));
  if (isUpcomingQuery(q)) {
    const sorted = [...schedule].sort((a, b): number => parseCountdown(a.countdownText) - parseCountdown(b.countdownText));
    const event = sorted.at(upcomingIndex[q]);
    if (event === undefined) return new Error("No upcoming events.");
    return formatEntry(event);
  }
  if (WEEK_DAYS.includes(q as WeekDay)) {
    const result = schedule.filter((entry): boolean => entry.dayText.toLowerCase().includes(q));
    return result.length > 0 ? result.map((entry): string => formatEntry(entry)) : new Error(`No events on ${q}.`);
  }
  return new Error(`Invalid PvP event query: "${q}"`);
};

export const calcPvpEvent = (rawQuery: PvpQuery): PvpEventResult[] | PvpEventResult | Error => {
  const q = normalizeQuery(rawQuery);
  const now = Date.now();
  const all = fixedSchedule.flatMap(entry => buildOccurrences(entry, now)).sort((a, b): number => a.time - b.time);
  if (q === "all") return all;
  if (q === "today") {
    const day = new Date(now).getDay();
    return all.filter((entry): boolean => new Date(entry.time).getDay() === day);
  }
  if (q === "tomorrow") {
    const day = (new Date(now).getDay() + 1) % 7;
    return all.filter((entry): boolean => new Date(entry.time).getDay() === day);
  }
  if (isUpcomingQuery(q)) {
    const future = all.filter((entry): boolean => entry.time > now);
    return future[upcomingIndex[q]] ?? new Error("No upcoming events.");
  }
  const past = /^past\[(\d+)]$/.exec(q);
  if (past !== null) {
    const previous = all.filter((entry): boolean => entry.time < now).reverse();
    return previous[Number(past[1])] ?? new Error("No past events.");
  }
  if (WEEK_DAYS.includes(q as WeekDay)) {
    const index = WEEK_DAYS.indexOf(q as WeekDay);
    return all.filter((entry): boolean => new Date(entry.time).getDay() === index);
  }
  return new Error(`Invalid PvP event query: "${q}"`);
};
