import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "daily",
  id: 6,
  category: "economy",
  description: "Claim your daily reward",
  aliases: ["reward"],
  args: [],
  permission: {},
  cooldown: 86_400, // 24 hours
  dependencies: ["code", "components", "tables", "currency", "config.LEGACY_COMMANDS.DAILY.BASE", "config.LEGACY_COMMANDS.DAILY.STREAK_INCREMENT"],
  execute: async ({ message, deps, userId, responses, isDiscord, isDrednot }): Promise<CommandResult> => {
    const {
      code, components, tables, currency,
      "config.LEGACY_COMMANDS.DAILY.BASE": amount,
      "config.LEGACY_COMMANDS.DAILY.STREAK_INCREMENT": increment
    } = deps;
    const streakRow = deps.tables.Economy.getStreak(userId);
    const reward = increment(amount, streakRow.streak);
    tables.Economy.addWallet(userId, reward);
    tables.Economy.addStreak(userId);

    const embed = components.createEmbed({
      title: "Daily Reward",
      description: `You have claimed your daily reward of **${currency.formatCurrency(reward)}**!`,
      color: "Gold",
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
