import type { CodeNumber } from "@command/dependencies";
import type { Command } from "@command/types/command";

export default {
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
  dependencies: ["code", "createEmbed"],
  execute: async ({ message, args, deps }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { code, createEmbed } = deps;
    const firstArgument = args[0];
    if (firstArgument === undefined) return [code.UserDefinedError, "Please provide a valid number of sides (greater than 1)."];
    const sides = Number.parseInt(firstArgument, 10);
    if (Number.isNaN(sides) || sides <= 1) return [code.UserDefinedError, "Please provide a valid number of sides (greater than 1)."];
    const result = Math.floor(Math.random() * sides) + 1;

    const embed = createEmbed({
      title: "Dice Roll",
      description: `You rolled a **${String(result)}** (1-${String(sides)})`,
      color: "Blue",
      options: { message, timestamp: new Date() },
    });

    await message.reply({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed">;