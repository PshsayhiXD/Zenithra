import type { Command, CommandResult } from "@commands/types/command.js";
import { time } from "discord.js";

export default {
  name: "userinfo",
  id: 21,
  category: "utility",
  description: "Display information about a user",
  aliases: ["whois", "ui"],
  cooldown: 5,
  permission: {},
  args: [],
  dependencies: ["code", "createEmbed"],
  execute: async (context): Promise<CommandResult> => {
    const { message, deps, isDiscord } = context;
    const { code, createEmbed } = deps;
    if (!isDiscord) return [code.UserDefinedError, "This command currently only supports Discord."];
    if (!message) return [code.UserDefinedError, "Please provide a valid message."];
    const member = message.mentions.members?.first() ?? message.member;
    if (!member) return [code.UserDefinedError, "Member not found."];

    const user = member.user;
    const roles = member.roles.cache
      .filter(r => r.id !== message.guild?.id)
      .sorted((a, b) => b.position - a.position)
      .map(r => r.toString());

    const embed = createEmbed({
      title: `User Information - ${user.tag}`,
      thumbnail: user.displayAvatarURL({ size: 1024 }),
      fields: [
        { name: "ID", value: user.id, inline: true },
        { name: "Nickname", value: member.nickname ?? "None", inline: true },
        { name: "Account Created", value: `${time(user.createdAt, "R")} (${time(user.createdAt, "D")})`, inline: false },
        { name: "Joined Server", value: `${time(member.joinedAt ?? new Date(), "R")} (${time(member.joinedAt ?? new Date(), "D")})`, inline: false },
        { name: `Roles [${String(roles.length)}]`, value: roles.length > 0 ? roles.join(", ") : "None", inline: false },
      ],
      color: member.displayHexColor,
      options: {
        message,
        timestamp: new Date()
      },
    });

    await message.reply({ embeds: [embed] });
    return code.Success;
  },
} satisfies Command<"code" | "createEmbed">;
