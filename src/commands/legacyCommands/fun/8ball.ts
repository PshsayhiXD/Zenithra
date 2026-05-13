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
  execute: async ({ message, args, deps }): Promise<CommandResult> => {
    const { code, createEmbed } = deps;
    if (args.length === 0) return [code.UserDefinedError, "Please ask a question!"];

    const responses = [
      "It is certain.",
      "Yes, definitely.",
      "Most likely.",
      "Yes.",
      "Ask again later.",
      "Better not tell you now.",
      "Very doubtful."
    ];
    const response = responses[Math.floor(Math.random() * responses.length)] ?? "Reply hazy, try again.";
    const question = args.join(" ");

    const embed = createEmbed({
      title: "Magic 8-Ball",
      fields: [
        { name: "Question", value: question },
        { name: "Answer", value: response }
      ],
      color: "Purple",
      options: { message, timestamp: new Date() },
    });

    await message.reply({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed">;
