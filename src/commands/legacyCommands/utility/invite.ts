import type { Command } from "@commands/types/command.js";

export const inviteCommand: Command<"env" | "createEmbed" | "code"> = {
  name: "invite",
  id: 18,
  category: "utility",
  description: "Invite the bot to your server",
  aliases: ["inv", "add"],
  permission: {},
  args: [],
  cooldown: 5,
  dependencies: ["env", "createEmbed", "code"],
  execute: async ({ message, deps }) => {
    const { env, createEmbed, code } = deps;
    const invite = env["opt_discord_bot_invite_url"];
    if (invite === undefined || invite === "") return [code.InternalError, "Invite URL is not configured."];
    await message.reply({
      embeds: [createEmbed({
        title: "Invite",
        description: `[Invite me to your server](${invite})`,
        color: "Blurple",
        thumbnail: message.client.user.displayAvatarURL(),
        footer: {
          text: message.author.tag,
          iconURL: message.author.displayAvatarURL(),
        },
        options: {
          timestamp: new Date(),
        },
      })],
    });
    return code.Success;
  },
};

export default inviteCommand;
