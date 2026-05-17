import type { Command, CommandResult } from "@commands/types/command.js";

export default {
  name: "daily",
  id: 6,
  category: "economy",
  description: "Claim your daily reward",
  aliases: ["reward"],
  args: [],
  permission: {},
  cooldown: 86_400, // 24 hours
  dependencies: ["code", "createEmbed", "tables"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, userId, responses, isDiscord, isDrednot } = context;
    const { code, createEmbed, tables } = deps;
    const amount = 500;

    tables.Economy.addWallet(userId, amount);

    const embed = createEmbed({
      title: "Daily Reward",
      description: `You have claimed your daily reward of **${String(amount)}** Dredcoins!`,
      color: "Gold",
      options: {
        ...(message ? { message } : {}),
        timestamp: new Date()
      },
    });

    if (isDiscord && message) await message.reply({ embeds: [embed] });
    if (isDrednot) responses?.push({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed" | "tables">;
