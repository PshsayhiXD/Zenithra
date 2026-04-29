import type { CodeNumber } from "@command/dependencies";
import type { Command } from "@command/types/command";

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
  execute: async ({ message, deps, cmd }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { tables, createEmbed, items, code } = deps;
    const userId = message.author.id;
    const inv = tables.Inventory.getUserInventory(userId);

    if (inv.length === 0) {
      await message.reply({
        embeds: [
          createEmbed({
            title: cmd.name,
            description: "Your inventory is empty.",
            color: "Yellow",
            options: { timestamp: new Date() },
          }),
        ],
      });
      return code.Success;
    }

    const description = inv
      .map((entry) => {
        const item = items.getItem(entry.itemId);
        const name = item ? item.name : `Unknown Item (${entry.itemId})`;
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
  },
} satisfies Command<"tables" | "createEmbed" | "items" | "code">;
