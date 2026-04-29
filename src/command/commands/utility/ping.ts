import type { CodeNumber } from "@dependencies";
import type { Command } from "@command/types/command.js";

export default {
  name: "ping",
  id: 19,
  category: "utility",
  description: "Check the bot's latency",
  aliases: ["pong"],
  cooldown: 5,
  args: [],
  permission: {},
  dependencies: ["code"],
  execute: async ({ message, deps }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { code } = deps;
    const message_ = await message.reply("Pinging...");
    const latency = message_.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);
    await message_.edit(`Pong! Latency: ${String(latency)}ms, API Latency: ${String(apiLatency)}ms`);
    return code.Success;
  }
} satisfies Command<"code">;
