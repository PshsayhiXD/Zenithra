import type { CodeNumber } from "@dependencies";
import type { Command } from "@command/types/command.js";

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
      type: "NUMBER",
      required: true,
      description: "Amount of coins to transfer",
    },
  ],
  aliases: ["pay", "give"],
  cooldown: 10,
  dependencies: ["code", "createEmbed", "tables"],
  execute: async ({ message, args, deps }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { code, createEmbed, tables } = deps;

    const target = message.mentions.users.first();
    if (!target) return [code.UserDefinedError, "Please mention a user to transfer coins to."];
    if (target.id === message.author.id) return [code.UserDefinedError, "You cannot transfer coins to yourself."];
    if (target.bot) return [code.UserDefinedError, "You cannot transfer coins to a bot."];

    const rawAmount = args[1] ?? args[0];
    if (typeof rawAmount !== "number" || rawAmount <= 0) return [code.UserDefinedError, "Please provide a valid amount to transfer."];
    const amount = Number.parseInt(rawAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) return [code.UserDefinedError, "Please provide a valid amount to transfer."];
    const senderWallet = tables.Economy.getWallet(message.author.id);
    if (senderWallet < amount) return [code.UserDefinedError, `You don't have enough Dredcoins. Your balance is **${String(senderWallet)}**.`];

    tables.Economy.addWallet(message.author.id, -amount);
    tables.Economy.addWallet(target.id, amount);

    const embed = createEmbed({
      title: "Transfer Successful",
      description: `Successfully transferred **${String(amount)}** Dredcoins to **${target.tag}**.`,
      color: "Green",
      options: { message, timestamp: new Date() },
    });

    await message.reply({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed" | "tables">;
