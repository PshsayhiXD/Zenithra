import type { Command, CommandResult } from "@commands/types/command.js";

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
  dependencies: ["tables", "createEmbed", "config.CURRENCY", "code", "number", "currency"],
  execute: async (context): Promise<CommandResult> => {
    const { args, deps, cmd, userId, responses, message, isDiscord, isDrednot } = context;
    const { tables, createEmbed, "config.CURRENCY": CURRENCY, code, currency } = deps;
    const wallet = tables.Economy.getWallet(userId);
    const bank = tables.Economy.getBank(userId);
    const amount = currency.parseCurrency(args.join(" "));
    if (amount <= 0)
      return [code.UserDefinedError, "Please specify a valid amount to deposit."];
    if (amount > wallet)
      return [
        code.UserDefinedError,
        `You only have **${currency.formatCurrency(wallet)}** in your wallet.`,
      ];
    if (bank.bank + amount * (1 - CURRENCY.FEE_PERCENT) > bank.bankCapacity)
      return [
        code.UserDefinedError,
        `Your bank capacity is only **${currency.formatCurrency(bank.bankCapacity)}**.`,
      ];

    const fee = CURRENCY.FEE_PERCENT * 100;
    const result = tables.Economy.deposit(userId, amount);

    const payload = {
      embeds: [
        createEmbed({
          title: cmd.name,
          description:
            `Deposited **${currency.formatCurrency(amount)}** (after ${String(fee)}% fee).\n` +
            `Wallet: **${currency.formatCurrency(result.currency)}**\n` +
            `Bank: **${currency.formatCurrency(result.bank)}**`,
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    };
    if (isDiscord && message) await message.reply(payload);
    if (isDrednot) responses?.push(payload);

    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "config.CURRENCY" | "code" | "number" | "currency">;
