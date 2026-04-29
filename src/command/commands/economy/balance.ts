import type { CodeNumber } from "@command/dependencies";
import type { Command } from "@command/types/command";

export default {
  name: "balance",
  id: 4,
  category: "economy",
  description: "Check your balance",
  permission: {},
  args: [],
  aliases: [],
  cooldown: 10,
  dependencies: ["tables", "createEmbed", "number", "config.CURRENCY", "code"],
  execute: async ({ message, deps, cmd }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { tables, createEmbed, number, "config.CURRENCY": CURRENCY, code } = deps;
    const wallet = tables.Economy.getWallet(message.author.id);
    const bank = tables.Economy.getBank(message.author.id);

    await message.reply({
      embeds: [
        createEmbed({
          title: cmd.name,
          description: `
            Wallet: **${number.formatNumber(wallet)}${CURRENCY.SYMBOL}**
            Bank: **${number.formatNumber(bank.bank)}** / **${number.formatNumber(bank.bankCapacity)}${CURRENCY.SYMBOL}**
          `.trim(),
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    });
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "number" | "config.CURRENCY" | "code">;
