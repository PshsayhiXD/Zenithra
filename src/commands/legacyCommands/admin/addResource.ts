import type { Command, CommandResult } from "@commands/types/command.js";
import { PermissionsBitField } from "discord.js";

export default {
  name: "addresource",
  id: 12,
  category: "admin",
  description: "Add any resource to a user (Admin only)",
  aliases: ["addres"],
  permission: { discord: [PermissionsBitField.Flags.Administrator] },
  args: [
    {
      name: "target",
      description: "The user to add resource to (optional, defaults to self)",
      type: "string",
      required: false,
    },
    {
      name: "resource",
      description: "The resource to add (e.g., '10 metal', '1 flux')",
      type: "string",
      required: true,
    },
  ],
  cooldown: 0,
  dependencies: ["tables", "createEmbed", "code", "currency"],
  execute: async ({ message, args, deps, cmd }): Promise<CommandResult> => {
    const { tables, createEmbed, code, currency } = deps;

    let targetId: string;
    let resourceStartIndex: number;

    const mentionId = message.mentions.users.first()?.id;
    if (mentionId === undefined) {
      const firstArgument = args[0];
      if (firstArgument !== undefined && /^\d{17,20}$/.test(firstArgument)) {
        targetId = firstArgument;
        resourceStartIndex = 1;
      } else {
        targetId = message.author.id;
        resourceStartIndex = 0;
      }
    } else {
      targetId = mentionId;
      resourceStartIndex = 1;
    }

    const resourceInput = args.slice(resourceStartIndex).join(" ");
    if (resourceInput === "") return [code.UserDefinedError, "Please provide a resource amount."];
    const amount = currency.parseCurrency(resourceInput);
    if (amount === 0) return [code.UserDefinedError, "Invalid resource amount or type."];

    const result = tables.Economy.addWallet(targetId, amount);

    await message.reply({
      embeds: [
        createEmbed({
          title: cmd.name,
          description: `Added **${currency.formatCurrency(amount)}** to **<@${targetId}>**.\nNew balance: **${currency.formatCurrency(result.currency)}**`,
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    });

    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "code" | "currency">;
