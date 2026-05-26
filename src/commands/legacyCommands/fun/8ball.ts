import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "8ball",
  id: 13,
  category: "fun",
  description: "Ask the magic 8-ball a question",
  cooldown: 3,
  aliases: ["8b", "ball"],
  args: [
    {
      name: "question",
      description: "The question to ask",
      type: "string",
      required: true,
    },
  ],
  permission: {},
  dependencies: ["code", "components"],
  execute: async ({ message, args, deps, responses, isDiscord, isDrednot }): Promise<CommandResult> => {
    const { code, components } = deps;
    if (args.length === 0) return [code.UserDefinedError, "Please ask a question!"];

    const answers = [
      "It is certain.",
      "Yes, definitely.",
      "Most likely.",
      "Yes.",
      "Ask again later.",
      "Better not tell you now.",
      "Very doubtful."
    ];
    const response = answers[Math.floor(Math.random() * answers.length)] ?? "Reply hazy, try again.";
    const question = args.join(" ");

    const embed = components.createEmbed({
      title: "Magic 8-Ball",
      fields: [
        { name: "Question", value: question },
        { name: "Answer", value: response }
      ],
      color: "Purple",
      options: {
        ...(message ? { message } : {}),
        timestamp: new Date(),
      },
    });

    if (isDiscord && message) await message.reply({ embeds: [embed] });
    if (isDrednot) responses?.push(`${question}. ${response}`);
    return code.Success;
  },
});
