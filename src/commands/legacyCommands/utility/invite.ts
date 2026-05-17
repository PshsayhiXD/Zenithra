import type { Command, CommandResult } from "@commands/types/command.js";

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
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, responses, isDiscord, isDrednot } = context;
    const { env, createEmbed, code } = deps;
    const invite = env["opt_discord_bot_invite_url"];
    if (invite === undefined || invite === "") return [code.InternalError, "Invite URL is not configured."];
    const payload = {
      embeds: [createEmbed({
        title: "Invite",
        description: `[Invite me to your server](${invite})`,
        color: "Blurple",
        options: {
          ...(message ? { message } : {}),
          timestamp: new Date(),
        },
      })],
    };
    if (isDiscord && message) await message.reply(payload);
    if (isDrednot) responses?.push(payload);
    return code.Success;
  },
};

export default inviteCommand;
