import type { CodeNumber } from "@dependencies";
import type { Command } from "@command/types/command.js";

export default {
  name: "adddredcoin",
  id: 3,
  category: "economy",
  description: "Add dredcoin to a user",
  aliases: [],
  permission: {},
  args: [
    {
      name: "userid",
      description: "The user to add dredcoin to",
      type: "string",
      required: true
    },
    {
      name: "amount",
      description: "The amount of dredcoin to add",
      type: "number",
      required: true
    }
  ],
  cooldown: 10,
  dependencies: ["tables", "createEmbed", "number", "config.CURRENCY", "code"],
  execute: async ({ message, args, deps, cmd }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { tables, createEmbed, number, "config.CURRENCY": CURRENCY, code } = deps;
    const targetUser = message.mentions.users.first()?.id ?? args[0];
    if (targetUser === undefined || targetUser === "") return [code.UserDefinedError, "Please provide a user."];
    const amount = Number.parseInt(args[1] ?? "0");
    if (Number.isNaN(amount)) return [code.UserDefinedError, "Please provide a valid amount."];
    const result = tables.Economy.addWallet(targetUser, amount);
    const username = targetUser;
    await message.reply({
      embeds: [createEmbed({
        title: cmd.name,
        description: `Added **${number.formatNumber(amount)}${CURRENCY.SYMBOL}** to **<@${username}>**.\nNew balance: **${number.formatNumber(result.currency)}${CURRENCY.SYMBOL}**`,
        color: "Green",
        options: { timestamp: new Date() }
      })]
    });
    return code.Success;
  }
} satisfies Command<"tables" | "createEmbed" | "number" | "config.CURRENCY" | "code">;
