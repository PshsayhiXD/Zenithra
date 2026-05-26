import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "balance",
  id: 4,
  category: "economy",
  description: "Check your balance",
  permission: {},
  args: [],
  aliases: [],
  cooldown: 10,
  dependencies: ["tables", "components", "config.CURRENCY", "code", "currency"],
  execute: async (context): Promise<CommandResult> => {
    const { deps, userId, username, responses, message, isDiscord, isDrednot } = context;
    const { tables, components, code, currency } = deps;
    const wallet = tables.Economy.getWallet(userId);
    const bank = tables.Economy.getBank(userId);

    const payload = {
      embeds: [
        components.createEmbed({
          title: `${username}'s Balance`,
          description: `
            **Wallet:** ${currency.formatCurrency(wallet)}
            **Bank:** ${currency.formatCurrency(bank.bank)} / ${currency.formatCurrency(bank.bankCapacity)}
          `.trim(),
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    };
    if (isDiscord && message) await message.reply(payload);
    if (isDrednot) responses?.push(`
      ${username}'s Balance: ${currency.formatCurrency(wallet)} / ${currency.formatCurrency(bank.bank)} (Bank Capacity: ${currency.formatCurrency(bank.bankCapacity)})
    `);
    return code.Success;
  },
});
