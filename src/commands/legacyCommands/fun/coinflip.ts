import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "coinflip",
  id: 16,
  category: "fun",
  description: "Flip a coin",
  aliases: ["cf", "flip"],
  cooldown: 3,
  permission: {},
  args: [],
  dependencies: ["code", "components"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, responses, isDiscord, isDrednot } = context;
    const { code, components } = deps;
    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    const embed = components.createEmbed({
      title: "Coin Flip",
      description: `The coin landed on: **${result}**!`,
      color: "Blue",
      options: {
        ...(message ? { message } : {}),
        timestamp: new Date(),
      },
    });

    if (isDiscord && message) await message.reply({ embeds: [embed] });
    if (isDrednot) responses?.push(embed.data.description ?? " ");
    return code.Success;
  },
});
