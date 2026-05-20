import type { Command, CommandResult } from "@commands/types/command.js";

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
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, responses, isDiscord, isDrednot } = context;
    const { code } = deps;

    if (isDiscord) {
      if (!message) return [code.UserDefinedError, "Please provide a valid message."];
      const pendingReply = await message.reply("Pinging...");
      const latency = pendingReply.createdTimestamp - message.createdTimestamp;
      const apiLatency = Math.round(message.client.ws.ping);
      await pendingReply.edit(`Pong! Latency: ${latency.toString()}ms, API Latency: ${apiLatency.toString()}ms`);
      return code.Success;
    }

    if (isDrednot) {
      responses?.push("Pong!");
      return code.Success;
    }

    return code.Success;
  }
} satisfies Command<"code">;
