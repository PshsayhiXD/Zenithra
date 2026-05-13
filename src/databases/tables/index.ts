export * as Cooldown from "@tables/cooldown/index.js";
export * as Guild from "@tables/guild/index.js";
export * as User from "@tables/user/index.js";
export * as GlobalSlashCommands from "@tables/globalSlashCommands/index.js";
export * as Economy from "@tables/economy/index.js";
export * as Inventory from "@tables/inventory/index.js";

export {
  getChannels,
  resetChannels,
  setChannel,
  updateChannels,
  deleteGuildSlashCommand,
  getAllGuildSlashCommands,
  getGuildSlashCommand,
  setGuildSlashCommand,
} from "./guild/index.js";

export {
  deleteGlobalSlashCommand,
  getGlobalSlashCommand,
  setGlobalSlashCommand,
} from "./globalSlashCommands/index.js";
