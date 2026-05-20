import type { Command, CommandResult } from "@commands/types/command.js";

export default {
  name: "transfer",
  id: 10,
  category: "economy",
  description: "Transfer Dredcoins to another user",
  permission: {},
  args: [
    {
      name: "user",
      type: "USER",
      required: true,
      description: "User to transfer coins to",
    },
    {
      name: "amount",
      type: "string",
      required: true,
      description: "Amount of coins to transfer",
    },
  ],
  aliases: ["pay", "give"],
  cooldown: 10,
  dependencies: ["code", "createEmbed", "tables", "currency"],
  execute: async (context): Promise<CommandResult> => {
    const { message, args, deps, userId, isDiscord } = context;
    const { code, createEmbed, tables, currency } = deps;

    if (!isDiscord) return [code.UserDefinedError, "This command currently only supports Discord."];

    const target = message?.mentions.users.first();
    if (!target) return [code.UserDefinedError, "Please mention a user to transfer coins to."];
    if (target.id === userId) return [code.UserDefinedError, "You cannot transfer coins to yourself."];

    if (target.bot) return [code.UserDefinedError, "You cannot transfer coins to a bot."];

    const senderWallet = tables.Economy.getWallet(userId);
    const amount = currency.parseCurrency(args.join(" "));
    if (amount <= 0) return [code.UserDefinedError, "Please provide a valid amount to transfer."];

    if (senderWallet < amount) return [
        code.UserDefinedError,
        `You only have **${currency.formatCurrency(senderWallet)}** in your wallet.`,
      ];

    tables.Economy.addWallet(userId, -amount);
    tables.Economy.addWallet(target.id, amount);

    const embed = createEmbed({
      title: "Transfer Successful",
      description:
        `Successfully transferred **${currency.formatCurrency(amount)}** Dredcoins to **${target.tag}**.`,
      color: "Green",
      options: {
        ...(message ? { message } : {}),
        timestamp: new Date(),
      },
    });

    if (message) await message.reply({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed" | "tables" | "currency">;
