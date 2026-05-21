import type { Command, CommandResult } from "@commands/types/command.js";

export default {
  name: "meme",
  id: 14,
  category: "fun",
  description: "Get a random meme from Reddit",
  aliases: ["memes"],
  args: [],
  permission: {},
  cooldown: 5,
  dependencies: ["code", "components"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, responses, isDiscord, isDrednot } = context;
    const { code, components } = deps;

    try {
      const response = await fetch("https://meme-api.com/gimme");
      const data = await response.json() as {
        title: string;
        url: string;
        postLink: string;
        subreddit: string;
        nsfw: boolean;
        spoiler: boolean;
        author: string;
        ups: number;
      };

      if (data.nsfw || data.spoiler) return [code.UserDefinedError, "Fetched a meme but it was NSFW or a spoiler. Please try again."];

      const embed = components.createEmbed({
        title: data.title,
        description: data.url,
        image: data.url,
        footer: {
          text: `r/${data.subreddit} | 👍 ${String(data.ups)} | by ${data.author}`,
        },
        options: {
          ...(message ? { message } : {}),
          timestamp: new Date(),
        },
      });

      if (isDiscord && message) await message.reply({ embeds: [embed] });
      if (isDrednot) responses?.push({ embeds: [embed] });
      return code.Success;
    } catch {
      return [code.InternalError, "Failed to fetch a meme. The API might be down."];
    }
  },
} satisfies Command<"code" | "components">;
