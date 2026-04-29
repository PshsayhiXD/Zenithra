import { Client, type Guild, GatewayIntentBits } from "discord.js";
import { MINUTE, HOUR } from "@utilities/time.js";
import { Cache } from "@utilities/cache.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

export const cache = {
  users: new Cache<ReturnType<Client["users"]["cache"]["get"]>>("users", "file"),
  channels: new Cache<ReturnType<Client["channels"]["cache"]["get"]>>("channels", "file"),
  guilds: new Cache<Guild>("guilds", "file"),
};

export const updateCache = (): true => {
  for (const [id, user] of client.users.cache.entries()) cache.users.set(id, user, MINUTE * 10);
  for (const [id, channel] of client.channels.cache.entries()) cache.channels.set(id, channel, MINUTE * 10);
  for (const [id, guild] of client.guilds.cache.entries()) cache.guilds.set(id, guild, HOUR);
  return true;
};

export default client;
