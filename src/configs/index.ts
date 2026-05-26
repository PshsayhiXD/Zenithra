import { LEGACY_COMMANDS } from "@configs/legacyCommands.js";
import { SLASH_COMMANDS } from "@configs/slashCommands.js";
import { CURRENCY } from "@configs/currency.js";
import { MISSION } from "@configs/mission.js";
import { PROXY } from "@configs/proxy.js";
import { USERNAME } from "@configs/username.js";
import { RARITIES } from "@configs/rarities.js";
import { EMOJIS } from "@configs/emojis.js";

export interface Config {
  MISSION: typeof MISSION;
  PROXY: typeof PROXY;
  LEGACY_COMMANDS: typeof LEGACY_COMMANDS;
  SLASH_COMMANDS: typeof SLASH_COMMANDS;
  CURRENCY: typeof CURRENCY;
  USERNAME: typeof USERNAME;
  RARITIES: typeof RARITIES;
  EMOJIS: typeof EMOJIS;
}

const config = {
  MISSION,
  PROXY,
  LEGACY_COMMANDS,
  SLASH_COMMANDS,
  CURRENCY,
  USERNAME,
  RARITIES,
  EMOJIS,
} as const satisfies Config;

export default config;
