import { COMMANDS } from "@configs/legacyCommands.js";
import { CURRENCY } from "@configs/currency.js";
import { MISSION } from "@configs/mission.js";
import { PROXY } from "@configs/proxy.js";
import { USERNAME } from "@configs/username.js";

export interface Config {
  MISSION: typeof MISSION;
  PROXY: typeof PROXY;
  COMMANDS: typeof COMMANDS;
  CURRENCY: typeof CURRENCY;
  USERNAME: typeof USERNAME;
}

const config = {
  MISSION,
  PROXY,
  COMMANDS,
  CURRENCY,
  USERNAME,
} as const satisfies Config;

export default config;
