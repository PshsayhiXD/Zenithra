import type { Command, CommandResult } from "@command/types/command.js";

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
  dependencies: ["tables", "createEmbed", "number", "config.CURRENCY", "code", "currency"],
  execute: async ({ message, args, deps, cmd }): Promise<CommandResult> => {
    const { tables, createEmbed, code, currency } = deps;
    const userId = message.author.id;
    const bank = tables.Economy.getBank(userId).bank;
    const amount = currency.parseCurrency(args.join(" "));
    if (amount <= 0) return [code.UserDefinedError, "Please specify a valid amount to withdraw."];
    if (amount > bank) return [code.UserDefinedError, `You only have **${currency.formatCurrency(bank)}** in your bank.`];
    const result = tables.Economy.withdraw(userId, amount);
    await message.reply({
      embeds: [
        createEmbed({
          title: cmd.name,
          description: `
            Withdrew **${currency.formatCurrency(amount)}** from your bank.
            Wallet: **${currency.formatCurrency(result.currency)}**
            Bank: **${currency.formatCurrency(result.bank)}**
          `.trim(),
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    });
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "number" | "config.CURRENCY" | "code" | "currency">;
