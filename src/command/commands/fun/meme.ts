import type { Command, CommandResult } from "@command/types/command.js";

export default {
  name: "meme",
  id: 14,
  category: "fun",
  description: "Get a random meme from Reddit",
  aliases: ["memes"],
  args: [],
  permission: {},
  cooldown: 5,
  dependencies: ["code", "createEmbed"],
  execute: async ({ message, deps }): Promise<CommandResult> => {
    const { code, createEmbed } = deps;

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

      const embed = createEmbed({
        title: data.title,
        image: data.url,
        footer: {
          text: `r/${data.subreddit} | 👍 ${String(data.ups)} | by ${data.author}`,
        },
        options: { message, timestamp: new Date() },
      });

      await message.reply({ embeds: [embed] });
      return code.Success;
    } catch {
      return [code.InternalError, "Failed to fetch a meme. The API might be down."];
    }
  },
} satisfies Command<"code" | "createEmbed">;
