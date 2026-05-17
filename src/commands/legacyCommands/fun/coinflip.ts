import type { Command, CommandResult } from "@commands/types/command.js";

export default {
  name: "coinflip",
  id: 16,
  category: "fun",
  description: "Flip a coin",
  aliases: ["cf", "flip"],
  cooldown: 3,
  permission: {},
  args: [],
  dependencies: ["code", "createEmbed"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, responses, isDiscord, isDrednot } = context;
    const { code, createEmbed } = deps;
    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    const embed = createEmbed({
      title: "Coin Flip",
      description: `The coin landed on: **${result}**!`,
      color: "Blue",
      options: {
        ...(message ? { message } : {}),
        timestamp: new Date(),
      },
    });

    if (isDiscord && message) await message.reply({ embeds: [embed] });
    if (isDrednot) responses?.push({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed">;
