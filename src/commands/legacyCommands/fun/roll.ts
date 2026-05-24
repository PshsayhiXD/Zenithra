import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "roll",
  id: 15,
  category: "fun",
  description: "Roll a dice",
  aliases: [],
  permission: {},
  args: [
    {
      name: "number",
      type: "number",
      required: false,
      description: "Number of sides"
    }
  ],
  cooldown: 3,
  dependencies: ["code", "components"],
  execute: async (context): Promise<CommandResult> => {
    const { message, args, deps, responses, isDiscord, isDrednot } = context;
    const { code, components } = deps;
    const firstArgument = args[0];
    if (firstArgument === undefined) return [code.UserDefinedError, "Please provide a valid number of sides (greater than 1)."];
    const sides = Number.parseInt(firstArgument, 10);
    if (Number.isNaN(sides) || sides <= 1) return [code.UserDefinedError, "Please provide a valid number of sides (greater than 1)."];
    const result = Math.floor(Math.random() * sides) + 1;

    const embed = components.createEmbed({
      title: "Dice Roll",
      description: `You rolled a **${String(result)}** (1-${String(sides)})`,
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
