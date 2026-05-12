import type { Command, CommandResult } from "@command/types/command.js";
import type { GuildChannels } from "@tables/types/guild/index.js";
import { isTrackerKey, TRACKERS } from "@tables/types/guild/channels.js";

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
  dependencies: ["tables", "createEmbed", "code"],
  execute: async ({ message, args, deps, cmd }): Promise<CommandResult> => {
    const { tables, createEmbed, code } = deps;
    if (message.guildId === null)
      return [code.InternalError, "Couldnt find guild."];
    const typeArgument = args[0];
    if (typeArgument === undefined || !isTrackerKey(typeArgument))
      return [code.UserDefinedError, `Invalid tracker type.\n**Available types**:\n- ${TRACKERS.join("\n- ")}`];
    const trackerType = typeArgument;
    const channel =
      message.mentions.channels.first() ?? message.channel;
    const update: Partial<GuildChannels> = {
      [trackerType]: true,
      [`${trackerType}Channel`]: channel.id,
      [`${trackerType}Message`]: "",
    };
    tables.updateChannels(message.guildId, update);
    await message.reply({
      embeds: [
        createEmbed({
          title: cmd.name,
          description: `Set ${trackerType} channel to ${channel.toString()}`,
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
} satisfies Command<
  "tables" | "createEmbed" | "code"
>;
