import type { Command, CommandResult } from "@commands/types/command.js";
import type { Item } from "@modules/types/item.js";

export default {
  name: "inventory",
  id: 8,
  category: "economy",
  description: "View your collected items.",
  aliases: [],
  permission: {},
  args: [],
  cooldown: 5,
  dependencies: ["tables", "createEmbed", "items", "code"],
  execute: async ({ message, deps }): Promise<CommandResult> => {
    const { tables, createEmbed, items, code } = deps;
    const getItem = items.getItem as (query: string | number) => Item | undefined;
    const userId = message.author.id;
    const inv = tables.Inventory.getUserInventory(userId);

    if (inv.length > 0) {
      const description = inv
        .map((entry) => {
          const item = getItem(entry.itemId);
          const name = item === undefined ? `Unknown Item (${entry.itemId})` : item.name;
          return `**${name}** x${String(entry.quantity)}`;
        })
        .join("\n");

      await message.reply({
        embeds: [
          createEmbed({
            title: `${message.author.username}'s Inventory`,
            description,
            color: "Blue",
            options: { timestamp: new Date() },
          }),
        ],
      });
      return code.Success;
    }

    await message.reply({
      embeds: [
        createEmbed({
          title: "Inventory",
          description: "Your inventory is empty.",
          color: "Yellow",
          options: { timestamp: new Date() },
        }),
      ],
    });
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "items" | "code">;
