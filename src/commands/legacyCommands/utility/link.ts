import type { Command, CommandResult } from "@commands/types/command.js";

export default {
  name: "link",
  id: 24,
  category: "utility",
  description: "Link your account with Discord",
  aliases: [],
  permission: {},
  args: [],
  cooldown: 5,
  dependencies: ["createEmbed", "code"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, responses, isDiscord, isDrednot, cmd } = context;
    const { createEmbed, code } = deps;

    const payload = {
      embeds: [createEmbed({
        title: cmd.name,
        description: "To link your account with Discord, please open the Zenithra Portal in your browser and use the 'Link via Discord' button.",
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
} satisfies Command<"createEmbed" | "code">;
