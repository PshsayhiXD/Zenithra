import { COMMANDS } from "@configs/legacyCommands.js";
import { CURRENCY } from "@configs/currency.js";
import { MISSION } from "@configs/mission.js";
import { PROXY } from "@configs/proxy.js";

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
