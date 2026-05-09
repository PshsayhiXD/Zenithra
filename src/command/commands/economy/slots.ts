import type { Command, CommandResult } from "@command/types/command.js";

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
  dependencies: ["code", "createEmbed", "tables", "config.CURRENCY", "number", "currency"],
  execute: async ({ message, args, deps }): Promise<CommandResult> => {
    const { code, createEmbed, tables, currency } = deps;

    const amountRaw = Number(currency.parseCurrency(args.join(" ")));
    if (amountRaw <= 0)
      return [code.UserDefinedError, "Please provide a valid bet amount."];

    const amount = amountRaw;
    const wallet = tables.Economy.getWallet(message.author.id);

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
      if (amount > Number.MAX_SAFE_INTEGER / multiplier)
        return [code.UserDefinedError, "Bet amount is too high."];
      win = amount * multiplier;
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      multiplier = 2;
      if (amount > Number.MAX_SAFE_INTEGER / multiplier) return [code.UserDefinedError, "Bet amount is too high."];
      win = amount * multiplier;
    }

    if (win > 0) tables.Economy.addWallet(message.author.id, win - amount);
    else tables.Economy.addWallet(message.author.id, -amount);
    const resultString = `[ ${String(slot1)} | ${String(slot2)} | ${String(slot3)} ]`;
    const embed = createEmbed({
      title: "Slot Machine",
      description:
        `${resultString}\n\n${
          win > 0
            ? `You won **${currency.formatCurrency(win)}**! (${String(multiplier)}x)`
            : `You lost **${currency.formatCurrency(amount)}**.`}`,
      color: win > 0 ? "Green" : "Red",
      options: { message, timestamp: new Date() },
    });

    await message.reply({ embeds: [embed] });

    return code.Success;
  },
} satisfies Command<"code" | "createEmbed" | "tables" | "config.CURRENCY" | "number" | "currency">;
