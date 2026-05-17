import type { Command, CommandResult } from "@commands/types/command.js";
import type { Item } from "@modules/types/item.js";

export default {
  name: "balance",
  id: 4,
  category: "economy",
  description: "Check your balance",
  permission: {},
  args: [],
  aliases: [],
  cooldown: 10,
  dependencies: ["tables", "createEmbed", "number", "config.CURRENCY", "code", "items", "currency"],
  execute: async (context): Promise<CommandResult> => {
    const { deps, userId, username, responses, message, isDiscord, isDrednot } = context;
    const { tables, createEmbed, number, code, items, currency } = deps;
    const getItem = items.getItem as (query: string | number) => Item | undefined;
    const wallet = tables.Economy.getWallet(userId);
    const bank = tables.Economy.getBank(userId);

    const currencyItems = [
      "currency.fluxCrystal",
      "currency.hyperRubber",
      "currency.silicaCrystal",
      "currency.compressedMetal",
      "currency.metal",
      "currency.compressedExplosive",
      "currency.explosive",
      "currency.lootbox",
    ];

    const inventory = tables.Inventory.getUserInventory(userId);
    const heldCurrency = currencyItems
      .map(itemId => {
        const entry = inventory.find(index => index.itemId === itemId);
        if (!entry || entry.quantity <= 0) return null;
        const item = getItem(itemId);
        return `**${item?.name ?? itemId}**: ${number.formatNumber(entry.quantity)}`;
      })
      .filter(Boolean);

    const itemsSection = heldCurrency.length > 0
      ? `\n\n**Currency Items:**\n${heldCurrency.join("\n")}`
      : "";

    const payload = {
      embeds: [
        createEmbed({
          title: `${username}'s Balance`,
          description: `
            **Wallet:** ${currency.formatCurrency(wallet)}
            **Bank:** ${currency.formatCurrency(bank.bank)} / ${currency.formatCurrency(bank.bankCapacity)}
            ${itemsSection}
          `.trim(),
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    };
    if (isDiscord && message) await message.reply(payload);
    if (isDrednot) responses?.push(payload);
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "number" | "config.CURRENCY" | "code" | "items" | "currency">;
