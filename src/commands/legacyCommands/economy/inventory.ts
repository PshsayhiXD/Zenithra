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
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, userId, username, isDiscord } = context;
    const { tables, createEmbed, items, code } = deps;

    if (!isDiscord) return [code.Warning, "This command currently only supports Discord."];
    if (!message) return [code.UserDefinedError, "Please provide a valid message."];
    const getItem = items.getItem as (query: string | number) => Item | undefined;
    const inv = tables.Inventory.getUserInventory(userId);

    if (inv.length > 0) {
      const description = inv
        .map((entry) => {
          const item = getItem(entry.itemId);
          const name = item === undefined ? `Unknown Item (${entry.itemId})` : item.name;
          return `**${name}** x${String(entry.quantity)}`;
        })
        .join("\n");

      const payload = {
        embeds: [
          createEmbed({
            title: `${username}'s Inventory`,
            description,
            color: "Blue",
            options: {
              message,
              timestamp: new Date()
            },
          }),
        ],
      };
      await message.reply(payload);
      return code.Success;
    }

    const payload = {
      embeds: [
        createEmbed({
          title: `${username}'s Inventory`,
          description: "Your inventory is empty.",
          color: "Yellow",
          options: {
            message,
            timestamp: new Date()
          },
        }),
      ],
    };
    await message.reply(payload);
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "items" | "code">;
