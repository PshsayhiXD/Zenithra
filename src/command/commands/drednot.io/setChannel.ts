import type { CodeNumber } from "@dependencies";
import type { Command } from "@command/types/command.js";
import type { GuildChannels  } from "@tables/types/guild/index.js";

export default {
  name: "setchannel",
  id: 1,
  category: "drednot.io",
  args: [
    {
      name: "type",
      description: "The type of channel to set.",
      type: "string",
      required: true,
    },
    {
      name: "channel",
      description: "The channel to set.",
      type: "string",
      required: false,
    },
  ],
  aliases: [],
  permission: {},
  cooldown: 10,
  description: "Sets the channel for event tracker messages.",
  dependencies: ["tables", "createEmbed", "isGuildChannelType", "code"],

  execute: async ({ message, args, deps }): Promise<CodeNumber | [CodeNumber, string]> => {
    const { tables, createEmbed, isGuildChannelType, code } = deps;
    if (message.guildId === null) return [code.InternalError, "Couldnt find guild."];
    const typeArgument = args[0];
    if (typeArgument === undefined || typeArgument === "" || !isGuildChannelType(typeArgument)) {
      return [
        code.UserDefinedError,
        `Invalid type. Valid types: ${[
          "mission",
          "pvpEvent",
          "ship",
          "trade",
          "voiceChannel",
          "voiceState",
        ].join(", ")}`,
      ];
    }
    const t = typeArgument;
    const channel = message.mentions.channels.first() ?? message.channel;
    const update: Partial<GuildChannels> = {
      [t]: true,
      [`${t}Channel`]: channel.id,
      [`${t}Message`]: "",
    };
    tables.updateChannels(message.guildId, update);
    await message.reply({
      embeds: [
        createEmbed({
          title: "Success",
          description: `Set ${t} channel to ${channel.toString()}`,
          color: "Green",
          footer: {
            iconURL: message.author.displayAvatarURL(),
            text: `Set by ${message.author.username}`,
          },
          options: {
            timestamp: new Date(),
          },
        }),
      ],
    });
    return code.Success;
  },
} satisfies Command<"tables" | "createEmbed" | "isGuildChannelType" | "code">;
