import { Decimal } from "decimal.js";
import { randomInt } from "node:crypto";
import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
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
      description: "The amount of currency to bet",
      type: "number",
      required: true,
    },
  ],
  dependencies: ["code", "components", "tables", "config.CURRENCY", "number", "currency"],
  execute: async ({ message, args, deps, userId, responses, isDiscord, isDrednot }): Promise<CommandResult> => {
    const { code, components, tables, currency } = deps;

    const amountRaw = currency.parseCurrency(args.join(" "));
    if (amountRaw.lte(0))
      return [code.UserDefinedError, "Please provide a valid bet amount."];

    const amount = amountRaw;
    const wallet = tables.Economy.getWallet(userId);

    if (amount.gt(wallet))
      return [
        code.UserDefinedError,
        `You only have **${currency.formatCurrency(wallet)}** in your wallet.`,
      ];

    const symbols = ["🍒", "🍋", "🍇", "🍊", "💎", "🔔"];

    const slot1 = symbols[randomInt(symbols.length)];
    const slot2 = symbols[randomInt(symbols.length)];
    const slot3 = symbols[randomInt(symbols.length)];

    let win = new Decimal(0);
    let multiplier = new Decimal(0);

    if (slot1 === slot2 && slot2 === slot3) {
      multiplier = new Decimal(5);
      win = amount.mul(multiplier);
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      multiplier = new Decimal(2);
      win = amount.mul(multiplier);
    }

    if (win.gt(0)) tables.Economy.addWallet(userId, win.minus(amount));
    else tables.Economy.addWallet(userId, amount.neg());
    const resultString = `[ ${String(slot1)} | ${String(slot2)} | ${String(slot3)} ]`;
    const embed = components.createEmbed({
      title: "Slot Machine",
      description:
        `${resultString}\n\n${
          win.gt(0)
            ? `You won **${currency.formatCurrency(win)}**! (${currency.decimalToString(multiplier)}x)`
            : `You lost **${currency.formatCurrency(amount)}**.`}`,
      color: win.gt(0) ? "Green" : "Red",
      options: {
        ...(message ? { message } : {}),
        timestamp: new Date()
      },
    });

    if (isDiscord && message) await message.reply({ embeds: [embed] });
    if (isDrednot) responses?.push({ embeds: [embed] });

    return code.Success;
  },
});
