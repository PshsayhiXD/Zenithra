import type { CodeNumber } from "@command/dependencies";
import type { Command } from "@command/types/command";

export default {
  name: "deposit",
  id: 7,
  category: "economy",
  description: "Deposit dredcoin into your bank (5% fee).",
  aliases: ["dep"],
  args: [
    {
      name: "amount",
      description: "The amount to deposit, or 'all'.",
      type: "string",
      required: true,
    },
  ],
  permission: {},
  cooldown: 5,
  dependencies: ["tables", "createEmbed", "config.CURRENCY", "code", "number"],
  execute: async ({ message, args, deps, cmd }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { tables, createEmbed, "config.CURRENCY": CURRENCY, code, number: numberUtilities } = deps;
    const userId = message.author.id;
    const wallet = tables.Economy.getWallet(userId);
    const bank = tables.Economy.getBank(userId);
    const raw = args[0] ?? "";
    const amount = numberUtilities.parseNumber(raw);
    if (amount === undefined || amount <= 0)
      return [code.UserDefinedError, "Please specify a valid amount to deposit."];
    if (amount > wallet)
      return [
        code.UserDefinedError,
        `You only have **${numberUtilities.formatNumber(wallet)}${CURRENCY.SYMBOL}** in your wallet.`,
      ];
    if (bank.bank + amount * (1 - CURRENCY.FEE_PERCENT) > bank.bankCapacity)
      return [
        code.UserDefinedError,
        `Your bank capacity is only **${numberUtilities.formatNumber(bank.bankCapacity)}${CURRENCY.SYMBOL}**.`,
      ];

    const fee = CURRENCY.FEE_PERCENT * 100;
    const result = tables.Economy.deposit(userId, amount);

    await message.reply({
      embeds: [
        createEmbed({
          title: cmd.name,
          description:
            `Deposited **${numberUtilities.formatNumber(amount)}${CURRENCY.SYMBOL}** (after ${String(fee)}% fee).\n` +
            `Wallet: **${numberUtilities.formatNumber(result.currency)}${CURRENCY.SYMBOL}**\n` +
            `Bank: **${numberUtilities.formatNumber(result.bank)}${CURRENCY.SYMBOL}**`,
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    });

    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "config.CURRENCY" | "code" | "number">;
