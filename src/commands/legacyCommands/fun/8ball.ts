import type { Command, CommandResult } from "@commands/types/command.js";

export default {
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
  dependencies: ["code", "createEmbed"],
  execute: async (context): Promise<CommandResult> => {
    const { message, args, deps, responses, isDiscord, isDrednot } = context;
    const { code, createEmbed } = deps;
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

    const embed = createEmbed({
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
} satisfies Command<"code" | "createEmbed">;
