import type { Command, CommandResult } from "@command/types/command.js";

export default {
  name: "compress",
  id: 17,
  category: "economy",
  description: "Compress resources into higher tiers.",
  aliases: [],
  permission: {},
  args: [
    {
      name: "resource",
      description: "The resource to compress (explosive, metal, compressedexplosive, compressedmetal, silica, rubber)",
      type: "string",
      required: true
    },
    {
      name: "amount",
      description: "How many times to compress (default 1)",
      type: "number",
      required: false
    }
  ],
  cooldown: 5,
  dependencies: ["tables", "createEmbed", "number", "code", "items"],
  execute: async ({ message, args, deps }): Promise<CommandResult> => {
    const { tables, createEmbed, number, code } = deps;
    const userId = message.author.id;
    const resource = args[0]?.toLowerCase();
    const count = Math.max(1, Number.parseInt(args[1] ?? "1"));

    if (Number.isNaN(count)) return [code.UserDefinedError, "Please provide a valid amount."];

    const tiers = [
      { id: "explosive", name: "Explosive", nextId: "currency.metal", nextName: "Metal", ratio: 10, isLiquid: true },
      { id: "currency.metal", name: "Metal", nextId: "currency.compressedExplosive", nextName: "Compressed Explosive", ratio: 10 },
      { id: "currency.compressedExplosive", name: "Compressed Explosive", nextId: "currency.compressedMetal", nextName: "Compressed Metal", ratio: 10 },
      { id: "currency.compressedMetal", name: "Compressed Metal", nextId: "currency.silicaCrystal", nextName: "Silica Crystal", ratio: 100 },
      { id: "currency.silicaCrystal", name: "Silica Crystal", nextId: "currency.hyperRubber", nextName: "Hyper Rubber", ratio: 100 },
      { id: "currency.hyperRubber", name: "Hyper Rubber", nextId: "currency.fluxCrystal", nextName: "Flux Crystal", ratio: 100 }
    ];

    const tier = tiers.find(t => t.id === resource || t.id.split(".")[1]?.toLowerCase() === resource);

    if (!tier) return [code.UserDefinedError, "Invalid resource. Valid: explosive, metal, compressedexplosive, compressedmetal, silica, rubber."];

    const needed = count * tier.ratio;

    const current = tier.isLiquid === true
      ? tables.Economy.getWallet(userId)
      : tables.Inventory.getUserItem(userId, tier.id)?.quantity ?? 0;

    if (current < needed) return [code.UserDefinedError, `You need **${number.formatNumber(needed)}** ${tier.name} to compress **${String(count)}** times!`];

    if (tier.isLiquid === true) tables.Economy.addWallet(userId, -needed);
    else tables.Inventory.removeItem(userId, tier.id, needed);

    tables.Inventory.addItem(userId, tier.nextId, count);

    await message.reply({
      embeds: [createEmbed({
        title: "Compression Successful",
        description: `Compressed **${number.formatNumber(needed)}** ${tier.name} into **${String(count)}** ${tier.nextName}.`,
        color: "Green",
        options: { timestamp: new Date() }
      })]
    });

    return code.Success;
  }
} satisfies Command<"tables" | "createEmbed" | "number" | "code" | "items">;
