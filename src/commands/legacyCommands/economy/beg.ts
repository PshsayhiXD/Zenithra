import type { Command, CommandResult } from "@commands/types/command.js";
import { Decimal } from "decimal.js";

export default {
  name: "beg",
  id: 5,
  category: "economy",
  description: "Beg for stuff",
  aliases: [],
  permission: {},
  args: [],
  cooldown: 10,
  dependencies: ["tables", "createEmbed", "number", "config.CURRENCY", "code", "currency"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, cmd, userId, responses, isDiscord, isDrednot } = context;
    const { tables, createEmbed, code, currency } = deps;
    const random = new Decimal(Math.floor(Math.random() * 100) + 30).mul("1e-16").toNumber();
    const result = tables.Economy.addWallet(userId, random);

    const payload = {
      embeds: [
        createEmbed({
          title: cmd.name,
          description: `
            Added **${currency.formatCurrency(random)}** to **<@${userId}>**.
            New balance: **${currency.formatCurrency(result.currency)}**
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
} satisfies Command<"tables" | "createEmbed" | "number" | "config.CURRENCY" | "code" | "currency">;
