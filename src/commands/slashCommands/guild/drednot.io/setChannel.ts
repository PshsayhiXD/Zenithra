import { ApplicationCommandOptionType } from "discord.js";
import { defineGuildSlashCommand, type SlashCommandResult } from "@commands/types/slashCommand.js";

import { GUILD_CHANNEL_TYPES, type GuildChannels } from "@tables/types/guild/index.js";
const channelTypeChoices = GUILD_CHANNEL_TYPES.map(k => ({
  name: k,
  value: k
}));

export default defineGuildSlashCommand({
  name: "setchannel",
  id: 1,
  category: "drednot.io",
  description: "Sets guild config to channel.",
  args: [
    {
      name: "channel",
      description: "The channel.",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "type",
      description: "The type of channel.",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: channelTypeChoices
    },
  ],
  permission: {},
  dependencies: ["tables", "components", "isGuildChannelType", "code"],
  execute: async ({ interaction, options, deps }): Promise<SlashCommandResult> => {
    const { tables, components, isGuildChannelType, code } = deps;

    const channel = options.getChannel("channel", true);
    const type = options.getString("type", true);

    if (interaction.guildId === null) return [code.InternalError, "Guild ID is not defined."];
    if (!isGuildChannelType(type)) return [code.UserDefinedError, "Invalid channel type."];

    const update: Partial<GuildChannels> = {
      [type]: true,
      [`${type}Channel`]: channel.id,
      [`${type}Message`]: ""
    };

    tables.updateChannels(interaction.guildId, update);

    await interaction.reply({
      embeds: [
        components.createEmbed({
          title: "Success",
          description: `Set ${type} channel to <#${channel.id}>`,
          color: "Green",
        }),
      ],
    });
    return code.Success;
  },
});
