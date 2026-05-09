import type { Command, CommandResult } from "@command/types/command.js";

export default {
  name: "avatar",
  id: 22,
  category: "utility",
  description: "Display a user's avatar",
  aliases: ["av", "pfp"],
  cooldown: 5,
  args: [],
  permission: {},
  dependencies: ["code", "createEmbed"],
  execute: async ({ message, deps }): Promise<CommandResult> => {
    const { code, createEmbed } = deps;
    const user = message.mentions.users.first() ?? message.author;
    const avatarURL = user.displayAvatarURL({ size: 1024, extension: "png" });

    const embed = createEmbed({
      title: `${user.username}'s Avatar`,
      image: avatarURL,
      options: { message, timestamp: new Date() },
    });

    await message.reply({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed">;
