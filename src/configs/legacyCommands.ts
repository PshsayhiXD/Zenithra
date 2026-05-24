import { Decimal } from "decimal.js";

const ECONOMY_BASE = new Decimal("1e-16");

export const LEGACY_COMMANDS = {
  // Commands default reactions
  ERROR_REACTION: "❌",
  SUCCESS_REACTION: "✅",
  WARNING_REACTION: "⚠️",
  COOLDOWN_REACTION: "⏳",

  HELP: {
    PAGE_SIZE: 10
  },
  DAILY: {
    BASE: ECONOMY_BASE.mul(500),
    STREAK_INCREMENT: (base: Decimal, streak: number): Decimal => base.mul(new Decimal(1).plus(new Decimal(streak).mul("0.1"))),
  },
  BEG: {
    BASE: ECONOMY_BASE.mul(100),
  },
} as const;
