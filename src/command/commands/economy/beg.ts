import type { Command, CommandResult } from "@command/types/command.js";

export default {
  name: "beg",
  id: 5,
  category: "economy",
  description: "Beg for stuff",
  aliases: [],
  permission: {},
  args: [],
  cooldown: 10,
  dependencies: ["tables", "createEmbed", "number", "config.CURRENCY", "code", "currency"],
  execute: async ({ message, deps, cmd }): Promise<CommandResult> => {
    const { tables, createEmbed, code, currency } = deps;
    const random = Math.floor(Math.random() * 100) + 30;
    const result = tables.Economy.addWallet(message.author.id, random);
    const username = message.author.id;
    await message.reply({
      embeds: [
        createEmbed({
          title: cmd.name,
          description: `
            Added **${currency.formatCurrency(random)}** to **<@${username}>**.
            New balance: **${currency.formatCurrency(result.currency)}**
          `.trim(),
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    });
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "number" | "config.CURRENCY" | "code" | "currency">;
