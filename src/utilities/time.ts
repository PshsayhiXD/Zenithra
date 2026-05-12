import { createLogger } from "@utilities/logger.js";

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const debounce = (function_: () => void, ms: number): () => void => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      function_();
    }, ms);
  };
};

export const loop = (function_: () => Promise<void>, ms: number): void => {
  void (async (): Promise<void> => {
    for (;;) {
      try {
        await function_();
      } catch (error: unknown) {
        const logger = createLogger("Loop");
        logger.error("Error in loop", error instanceof Error ? { error: error.message } : { error });
      }
      await wait(ms);
    }
  })();
};

export const executionTime = async <T>(
  name: string,
  function_: () => Promise<T>,
): Promise<T> => {
  const s = performance.now();
  const r = await function_();
  const logger = createLogger("ExecutionTime");
  logger.info(`${name}: ${(performance.now() - s).toFixed(2)}ms`);
  return r;
};

export type DiscordTimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export const toDiscordTimestamp = (date: string | number, style: DiscordTimestampStyle | "pretty" = "pretty"): string => {
  const d = new Date(date);
  const unix = Math.floor(d.getTime() / 1000);
  if (Number.isNaN(unix)) return "Invalid Date";
  if (style === "pretty") return `<t:${String(unix)}:F> (<t:${String(unix)}:R>)`;
  return `<t:${String(unix)}:${style}>`;
};

export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${String(days)}d ${String(hours % 24)}h ${String(minutes % 60)}m ${String(seconds % 60)}s`;
  if (hours > 0) return `${String(hours)}h ${String(minutes % 60)}m ${String(seconds % 60)}s`;
  if (minutes > 0) return `${String(minutes)}m ${String(seconds % 60)}s`;
  return `${String(seconds)}s`;
};

export const parseTime = (time: string): number => {
  const timeRegex = /(\d+)([dhmsw])/gi;
  let totalSeconds = 0;
  let match: RegExpExecArray | null;
  while ((match = timeRegex.exec(time)) !== null) {
    const [, rawValue, unit] = match;
    if (rawValue === undefined || unit === undefined) continue;
    const value = Number.parseInt(rawValue, 10);
    switch (unit) {
      case "s": {
        totalSeconds += value;
        break;
      }
      case "m": {
        totalSeconds += value * 60;
        break;
      }
      case "h": {
        totalSeconds += value * 60 * 60;
        break;
      }
      case "d": {
        totalSeconds += value * 60 * 60 * 24;
        break;
      }
    }
  }
  return totalSeconds;
};

/**
 * Time constants in milliseconds.
 */
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30 * DAY;
export const YEAR = 365 * DAY;
export const WEEK_DAYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

const units = {
  sec: SECOND, s: SECOND,
  min: MINUTE, m: MINUTE,
  hour: HOUR, h: HOUR,
  day: DAY, d: DAY,
  week: WEEK, w: WEEK,
  month: MONTH, mo: MONTH,
  year: YEAR, y: YEAR,
} as const;
export const msTo = (ms: number, u: keyof typeof units): number => Math.floor(ms / units[u]);
export const msFrom = (n: number, u: keyof typeof units): number => n * units[u];
