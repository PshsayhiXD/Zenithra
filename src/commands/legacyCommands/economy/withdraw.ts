import type { Command, CommandResult } from "@commands/types/command.js";

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
  dependencies: ["tables", "components", "number", "code", "currency"],
  execute: async (context): Promise<CommandResult> => {
    const { message, args, deps, cmd, userId, responses, isDiscord, isDrednot } = context;
    const { tables, components, code, currency } = deps;
    const bank = tables.Economy.getBank(userId).bank;
    const amount = currency.parseCurrency(args.join(" "));
    if (amount <= 0) return [code.UserDefinedError, "Please specify a valid amount to withdraw."];
    if (amount > bank) return [code.UserDefinedError, `You only have **${currency.formatCurrency(bank)}** in your bank.`];
    const result = tables.Economy.withdraw(userId, amount);
    const payload = {
      embeds: [
        components.createEmbed({
          title: cmd.name,
          description: `
            Withdrew **${currency.formatCurrency(amount)}** from your bank.
            Wallet: **${currency.formatCurrency(result.currency)}**
            Bank: **${currency.formatCurrency(result.bank)}**
          `.trim(),
          color: "Green",
          options: {
            ...(message ? { message } : {}),
            timestamp: new Date()
          },
        }),
      ],
    };
    if (isDiscord && message) await message.reply(payload);
    if (isDrednot) responses?.push(payload);
    return code.Success;
  },
} satisfies Command<"tables" | "components" | "number" | "code" | "currency">;
