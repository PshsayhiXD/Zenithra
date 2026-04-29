import type { CodeNumber } from "@dependencies";
import type { Command } from "@command/types/command.js";

export default {
  name: "beg",
  id: 5,
  category: "economy",
  description: "Beg for stuff",
  aliases: [],
  permission: {},
  args: [],
  cooldown: 10,
  dependencies: ["tables", "createEmbed", "number", "config.CURRENCY", "code"],
  execute: async ({ message, deps, cmd }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { tables, createEmbed, number, "config.CURRENCY": CURRENCY, code } = deps;
    const random = Math.floor(Math.random() * 100) + 30;
    const result = tables.Economy.addWallet(message.author.id, random);
    const username = message.author.id;
    await message.reply({
      embeds: [
        createEmbed({
          title: cmd.name,
          description: `
            Added **${number.formatNumber(random)}${CURRENCY.SYMBOL}** to **<@${username}>**.
            New balance: **${number.formatNumber(result.currency)}${CURRENCY.SYMBOL}**
          `.trim(),
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    });
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "number" | "config.CURRENCY" | "code">;
