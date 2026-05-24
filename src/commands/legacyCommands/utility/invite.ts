import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "invite",
  id: 18,
  category: "utility",
  description: "Invite the bot to your server",
  aliases: ["inv", "add"],
  permission: {},
  args: [],
  cooldown: 5,
  dependencies: ["env", "components", "code"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, responses, isDiscord, isDrednot } = context;
    const { env, components, code } = deps;

    const invite = env["OPT_DISCORD_BOT_INVITE_URL"];
    if (invite === undefined || invite === "") return [code.InternalError, "Invite URL is not configured."];
    const payload = {
      embeds: [components.createEmbed({
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
});
