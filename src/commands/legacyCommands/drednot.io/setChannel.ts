import { defineLegacyCommand, type CommandResult } from "@commands/types/command.js";
import type { GuildChannels } from "@tables/types/guild/index.js";
import { isTrackerKey, TRACKERS } from "@tables/types/guild/channels.js";

export default defineLegacyCommand({
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
  dependencies: ["tables", "components", "code"],
  execute: async (context): Promise<CommandResult> => {
    const { message, args, deps, cmd, isDiscord } = context;
    const { tables, components, code } = deps;

    if (!isDiscord) return [code.UserDefinedError, "This command currently only supports Discord."];
    if (!message) return [code.InternalError, "Couldnt find message."];

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
    const payload = {
      embeds: [
        components.createEmbed({
          title: cmd.name,
          description: `Set ${trackerType} channel to ${channel.toString()}`,
          color: "Green",
          options: {
            message,
            timestamp: new Date(),
          },
        }),
      ],
    };
    await message.reply(payload);
    return code.Success;
  },
});
