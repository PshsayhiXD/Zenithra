import type { Command, CommandResult } from "@commands/types/command.js";
import { Decimal } from "decimal.js";

export default {
  name: "slots",
  id: 9,
  category: "economy",
  description: "Play the slot machine",
  aliases: ["slot"],
  cooldown: 10,
  permission: {},
  args: [
    {
      name: "amount",
      description: "The amount of Dredcoins to bet",
      type: "number",
      required: true,
    },
  ],
  dependencies: ["code", "components", "tables", "config.CURRENCY", "number", "currency"],
  execute: async (context): Promise<CommandResult> => {
    const { message, args, deps, userId, responses, isDiscord, isDrednot } = context;
    const { code, components, tables, currency } = deps;

    const amountRaw = currency.parseCurrency(args.join(" "));
    if (amountRaw <= 0)
      return [code.UserDefinedError, "Please provide a valid bet amount."];

    const amount = amountRaw;
    const wallet = tables.Economy.getWallet(userId);

    if (amount > wallet)
      return [
        code.UserDefinedError,
        `You only have **${currency.formatCurrency(wallet)}** in your wallet.`,
      ];

    const symbols = ["🍒", "🍋", "🍇", "🍊", "💎", "🔔"];

    const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

    let win = 0;
    let multiplier = 0;

    if (slot1 === slot2 && slot2 === slot3) {
      multiplier = 5;
      win = new Decimal(amount).mul(multiplier).toNumber();
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      multiplier = 2;
      win = new Decimal(amount).mul(multiplier).toNumber();
    }

    if (win > 0) tables.Economy.addWallet(userId, new Decimal(win).sub(amount).toNumber());
    else tables.Economy.addWallet(userId, -amount);
    const resultString = `[ ${String(slot1)} | ${String(slot2)} | ${String(slot3)} ]`;
    const embed = components.createEmbed({
      title: "Slot Machine",
      description:
        `${resultString}\n\n${
          win > 0
            ? `You won **${currency.formatCurrency(win)}**! (${String(multiplier)}x)`
            : `You lost **${currency.formatCurrency(amount)}**.`}`,
      color: win > 0 ? "Green" : "Red",
      options: {
        ...(message ? { message } : {}),
        timestamp: new Date()
      },
    });

    if (isDiscord && message) await message.reply({ embeds: [embed] });
    if (isDrednot) responses?.push({ embeds: [embed] });

    return code.Success;
  },
} satisfies Command<"code" | "components" | "tables" | "config.CURRENCY" | "number" | "currency">;
