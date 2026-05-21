import type { Command, CommandResult } from "@commands/types/command.js";

export default {
  name: "avatar",
  id: 22,
  category: "utility",
  description: "Display a user's avatar",
  aliases: ["av", "pfp"],
  cooldown: 5,
  args: [],
  permission: {},
  dependencies: ["code", "components"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, isDiscord } = context;
    const { code, components } = deps;

    if (!isDiscord) return [code.UserDefinedError, "This command currently only supports Discord."];
    if (!message) return [code.UserDefinedError, "Please provide a valid message."];

    const user = message.mentions.users.first() ?? message.author;
    const avatarURL = user.displayAvatarURL({ size: 1024, extension: "png" });

    const embed = components.createEmbed({
      title: `${user.username}'s Avatar`,
      image: avatarURL,
      options: {
        message,
        timestamp: new Date(),
      },
    });

    await message.reply({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "components">;
