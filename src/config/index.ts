import { COMMANDS } from "@config/commands";
import { CURRENCY } from "@config/currency";
import { MISSION } from "@config/mission";
import { PROXY } from "@config/proxy";

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