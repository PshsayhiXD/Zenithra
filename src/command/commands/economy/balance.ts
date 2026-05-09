import type { Command, CommandResult } from "@command/types/command.js";
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
  execute: async ({ message, deps }): Promise<CommandResult> => {
    const { tables, createEmbed, number, code, items, currency } = deps;
    const getItem = items.getItem as (query: string | number) => Item | undefined;
    const userId = message.author.id;
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

    await message.reply({
      embeds: [
        createEmbed({
          title: `${message.author.username}'s Balance`,
          description: `
            **Wallet:** ${currency.formatCurrency(wallet)}
            **Bank:** ${currency.formatCurrency(bank.bank)} / ${currency.formatCurrency(bank.bankCapacity)}
            ${itemsSection}
          `.trim(),
          color: "Green",
          options: { timestamp: new Date() },
        }),
      ],
    });
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "number" | "config.CURRENCY" | "code" | "items" | "currency">;
