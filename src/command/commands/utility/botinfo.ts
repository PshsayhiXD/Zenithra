import type { Command, CommandResult } from "@command/types/command.js";
import { version as djsVersion } from "discord.js";
import os from "node:os";

export default {
  name: "botinfo",
  id: 17,
  category: "utility",
  description: "Display information about the bot",
  aliases: ["bi", "info"],
  cooldown: 10,
  args: [],
  permission: {},
  dependencies: ["code", "createEmbed"],
  execute: async ({ message, deps }): Promise<CommandResult> => {
    const { code, createEmbed } = deps;
    const { client } = message;
    const user = client.user;

    const uptime = process.uptime();
    const uptimeString = `${String(Math.floor(uptime / 3600))}h ${String(Math.floor((uptime % 3600) / 60))}m ${String(Math.floor(uptime % 60))}s`;
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const embed = createEmbed({
      title: "Bot Information",
      thumbnail: user.displayAvatarURL(),
      fields: [
        { name: "Bot Tag", value: user.tag, inline: true },
        { name: "Bot ID", value: user.id, inline: true },
        { name: "Library", value: `discord.js v${djsVersion}`, inline: true },
        { name: "Node.js", value: process.version, inline: true },
        { name: "Uptime", value: uptimeString, inline: true },
        { name: "Memory", value: `${memoryUsage} MB`, inline: true },
        { name: "OS", value: `${os.type()} ${os.arch()}`, inline: true }
      ],
      options: { message, timestamp: new Date() },
    });

    await message.reply({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed">;
