import { Decimal } from "decimal.js";
import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "compress",
  id: 23,
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
  dependencies: ["tables", "components", "number", "code", "config.CURRENCY", "module.items"],
  execute: async ({ args, deps, userId, responses, message, isDiscord, isDrednot }): Promise<CommandResult> => {
    const { tables, components, number, code, "config.CURRENCY": currencyConfig, "module.items": items } = deps;
    const resource = args[0]?.toLowerCase();
    const parsedCount = Number.parseInt(args[1] ?? "1");

    if (Number.isNaN(parsedCount)) return [code.UserDefinedError, "Please provide a valid amount."];
    let count = parsedCount;
    if (count < 1) count = 1;

    const tiers = [
      { id: "explosive", name: "Explosive", nextId: "currency.metal", nextName: "Metal", ratio: 10, isLiquid: true },
      { id: "currency.metal", name: "Metal", nextId: "currency.compressedExplosive", nextName: "Compressed Explosive", ratio: 10 },
      { id: "currency.compressedExplosive", name: "Compressed Explosive", nextId: "currency.compressedMetal", nextName: "Compressed Metal", ratio: 10 },
      { id: "currency.compressedMetal", name: "Compressed Metal", nextId: "currency.silicaCrystal", nextName: "Silica Crystal", ratio: 100 },
      { id: "currency.silicaCrystal", name: "Silica Crystal", nextId: "currency.hyperRubber", nextName: "Hyper Rubber", ratio: 100 },
      { id: "currency.hyperRubber", name: "Hyper Rubber", nextId: "currency.fluxCrystal", nextName: "Flux Crystal", ratio: 100 }
    ];

    const tier = tiers.find(t => t.id === resource || t.id.split(".")[1]?.toLowerCase() === resource);
    if (tier === undefined) return [code.UserDefinedError, "Invalid resource. Valid: explosive, metal, compressedexplosive, compressedmetal, silica, rubber."];

    const nextItem = items.get(tier.nextId);
    if (nextItem === undefined) return [code.UserDefinedError, `Next tier item "${tier.nextId}" not found.`];

    const needed = count * tier.ratio;

    if (tier.isLiquid === true) {
      const liquidNeeded = new Decimal(needed).mul(currencyConfig.BASE);
      const current = tables.Economy.getWallet(userId);
      if (current.lt(liquidNeeded)) return [code.UserDefinedError, `You need **${number.formatNumber(needed)}** ${tier.name} to compress **${String(count)}** times!`];
      tables.Economy.addWallet(userId, liquidNeeded.neg());
    } else {
      const slots = tables.Inventory.getUserItemSlots(userId, tier.id);
      let total = 0;
      for (const slot of slots) total += slot.quantity;
      if (total < needed) return [code.UserDefinedError, `You need **${number.formatNumber(needed)}** ${tier.name} to compress **${String(count)}** times!`];

      let remaining = needed;
      for (const slot of slots) {
        if (remaining <= 0) break;
        const take = Math.min(slot.quantity, remaining);
        tables.Inventory.removeItem(userId, slot.hashId, take);
        remaining -= take;
      }
    }

    tables.Inventory.addItem(userId, nextItem, count);

    const payload = {
      embeds: [components.createEmbed({
        title: "Compression Successful",
        description: `Compressed **${number.formatNumber(needed)}** ${tier.name} into **${String(count)}** ${tier.nextName}.`,
        color: "Green",
        options: { timestamp: new Date() }
      })]
    };
    if (isDiscord && message) await message.reply(payload);
    if (isDrednot) responses?.push(payload);

    return code.Success;
  }
});
