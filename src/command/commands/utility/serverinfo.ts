import type { CodeNumber } from "@dependencies";
import type { Command } from "@command/types/command.js";
import { time } from "discord.js";

export default {
  name: "serverinfo",
  id: 20,
  category: "utility",
  description: "Display information about the server",
  aliases: ["si", "server"],
  cooldown: 10,
  args: [],
  permission: {},
  dependencies: ["code", "createEmbed"],
  execute: async ({ message, deps }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { code, createEmbed } = deps;
    const { guild } = message;
    if (!guild) return [code.UserDefinedError, "This command can only be used in a server."];

    const owner = await guild.fetchOwner();
    const channels = guild.channels.cache;
    const roles = guild.roles.cache;

    const embed = createEmbed({
      title: `Server Information - ${guild.name}`,
      thumbnail: guild.iconURL({ size: 1024 }) ?? "",
      fields: [
        { name: "Owner", value: owner.user.tag, inline: true },
        { name: "ID", value: guild.id, inline: true },
        { name: "Created At", value: `${time(guild.createdAt, "R")} (${time(guild.createdAt, "D")})`, inline: false },
        { name: "Members", value: guild.memberCount.toString(), inline: true },
        { name: "Roles", value: roles.size.toString(), inline: true },
        { name: "Channels", value: channels.size.toString(), inline: true },
        { name: "Boosts", value: `${String(guild.premiumSubscriptionCount ?? 0)} (Level ${String(guild.premiumTier)})`, inline: true },
      ],
      options: { message, timestamp: new Date() },
    });

    await message.reply({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed">;
