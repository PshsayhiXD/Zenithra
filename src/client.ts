import { Client, type Guild, GatewayIntentBits } from "discord.js";
import { MINUTE, HOUR } from "@utilities/time.js";
import { Cache } from "@utilities/cache.js";
import { createLogger } from "@utilities/logger.js";

const logger = createLogger("ClientCache")

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

export const cache = {
  users: new Cache<ReturnType<Client["users"]["cache"]["get"]>>("users", "file").init(),
  channels: new Cache<ReturnType<Client["channels"]["cache"]["get"]>>("channels", "file").init(),
  guilds: new Cache<Guild>("guilds", "file").init(),
};

export const updateCache = (): void => {
  for (const [id, user] of client.users.cache.entries()) cache.users.set(id, user, MINUTE * 10);
  for (const [id, channel] of client.channels.cache.entries()) cache.channels.set(id, channel, MINUTE * 10);
  for (const [id, guild] of client.guilds.cache.entries()) cache.guilds.set(id, guild, HOUR);
  logger.info("Updated client cache");
};

export default client;
