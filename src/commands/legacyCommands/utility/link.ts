import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";

export default defineLegacyCommand({
  name: "link",
  id: 24,
  category: "utility",
  description: "Link your account with Discord",
  aliases: [],
  permission: {},
  args: [],
  cooldown: 5,
  dependencies: ["components", "code"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, responses, isDiscord, isDrednot, cmd } = context;
    const { components, code } = deps;

    const payload = {
      embeds: [components.createEmbed({
        title: cmd.name,
        description: "https://discord.com/oauth2/authorize?client_id=1342359906510049291&response_type=code&redirect_uri=https%3A%2F%2Fintent-horribly-killdeer.ngrok-free.app%2Flink%2Fchat&scope=identify",
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
