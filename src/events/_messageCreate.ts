import type { Message } from "discord.js";
import { handleCommand } from "@commands/_legacyHandler.js";
import { cache } from "@/client.js";

export const onMessageCreate = async (message: Message): Promise<void> => {
  if (message.author.bot) return;
  cache.users.set(message.author.id, message.author);
  cache.channels.set(message.channel.id, message.channel);
  if (message.guild !== null) cache.guilds.set(message.guild.id, message.guild);
  await handleCommand(message);
};
