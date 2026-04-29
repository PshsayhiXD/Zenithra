import { COMMANDS } from "@config/commands.js";
import { CURRENCY } from "@config/currency.js";
import { MISSION } from "@config/mission.js";
import { PROXY } from "@config/proxy.js";

export interface Config {
  MISSION: typeof MISSION;
  PROXY: typeof PROXY;
  COMMANDS: typeof COMMANDS;
  CURRENCY: typeof CURRENCY;
}

const config = {
  MISSION,
  PROXY,
  COMMANDS,
  CURRENCY,
} as const satisfies Config;

export default config;
