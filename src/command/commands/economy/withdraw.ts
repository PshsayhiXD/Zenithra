import type { CodeNumber } from "@dependencies";
import type { Command } from "@command/types/command.js";

export default {
  name: "withdraw",
  id: 11,
  category: "economy",
  description: "Withdraw dredcoin from your bank.",
  aliases: ["with"],
  permission: {},
  args: [
    {
      name: "amount",
      description: "The amount to withdraw, or 'all'.",
      type: "string",
      required: true,
    },
  ],
  cooldown: 5,
  dependencies: ["tables", "createEmbed", "number", "config.CURRENCY", "code"],
  execute: async ({ message, args, deps, cmd }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { tables, createEmbed, number, "config.CURRENCY": CURRENCY, code } = deps;
    const userId = message.author.id;
    const bank = tables.Economy.getBank(userId).bank;
    const amountInput = args[0];
    if (amountInput === undefined) return [code.UserDefinedError, "Please specify a valid amount to withdraw."];
    const amount = number.parseNumber(amountInput);
    if (amount === undefined || amount <= 0) return [code.UserDefinedError, "Please specify a valid amount to withdraw."];
    if (amount > bank) return [code.UserDefinedError, `You only have **${number.formatNumber(bank)}${CURRENCY.SYMBOL}** in your bank.`];
    const result = tables.Economy.withdraw(userId, amount);
    await message.reply({
      embeds: [
        createEmbed({
          title: cmd.name,
          description: `
            Withdrew **${number.formatNumber(amount)}${CURRENCY.SYMBOL}** from your bank.
            Wallet: **${number.formatNumber(result.currency)}${CURRENCY.SYMBOL}**
            Bank: **${number.formatNumber(result.bank)}${CURRENCY.SYMBOL}**
          `.trim(),
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    });
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "number" | "config.CURRENCY" | "code">;
