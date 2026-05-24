import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";
import { time } from "discord.js";

export default defineLegacyCommand({
  name: "serverinfo",
  id: 20,
  category: "utility",
  description: "Display information about the server",
  aliases: ["si", "server"],
  cooldown: 10,
  args: [],
  permission: {},
  dependencies: ["code", "components"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, isDiscord } = context;
    const { code, components } = deps;

    if (!isDiscord) return [code.UserDefinedError, "This command currently only supports Discord."];
    if (!message) return [code.UserDefinedError, "Please provide a valid message."];

    const { guild } = message;
    if (!guild) return [code.UserDefinedError, "This command currently only supports in server."];

    const owner = await guild.fetchOwner();
    const channels = guild.channels.cache;
    const roles = guild.roles.cache;

    const embed = components.createEmbed({
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
      options: {
        message,
        timestamp: new Date(),
      },
    });

    await message.reply({ embeds: [embed] });
    return code.Success;
  },
});
