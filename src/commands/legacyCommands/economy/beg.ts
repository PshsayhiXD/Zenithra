import { Decimal } from "decimal.js";
import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "beg",
  id: 5,
  category: "economy",
  description: "Beg for stuff",
  aliases: [],
  permission: {},
  args: [],
  cooldown: 10,
  dependencies: ["tables", "components", "number", "config.CURRENCY", "config.LEGACY_COMMANDS.BEG.BASE", "code", "currency"],
  execute: async ({ message, deps, cmd, userId, responses, isDiscord, isDrednot }): Promise<CommandResult> => {
    const { tables, components, code, currency, "config.LEGACY_COMMANDS.BEG.BASE": base } = deps;

    const random = base.mul(Decimal.random()).floor();
    const result = tables.Economy.addWallet(userId, random);

    const payload = {
      embeds: [
        components.createEmbed({
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
    if (isDrednot) responses?.push(`New balance: **${currency.formatCurrency(result.currency)}**`);
    return code.Success;
  },
});
