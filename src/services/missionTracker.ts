import { type EmbedBuilder, type TextChannel, ChannelType } from "discord.js";
import { getGuild, getChannels, updateChannels } from "@tables/guild/index.js";
import { cache } from "@/client.js";

export const startMissionTracker = async (embed: EmbedBuilder): Promise<void> => {
  for (const guild of cache.guilds) {
    const guildData = getGuild(guild.id);
    if (guildData === undefined) continue;
    const channels = getChannels(guild.id);
    if (typeof channels.eventTrackerChannel !== "string") continue;
    const channel = await guild.channels
      .fetch(channels.eventTrackerChannel)
      .catch((): undefined => undefined);
    if (channel?.type !== ChannelType.GuildText) continue;
    if (!channel.isTextBased()) continue;
    if (typeof channels.eventTrackerMessage !== "string") continue;
    if (channels.eventTrackerMessage) {
      try {
        const message = await (channel as TextChannel).messages.fetch(
          channels.eventTrackerMessage
        );
        await message.edit({ embeds: [embed] });
        continue;
      } catch {
        void 0;
      }
    }
    const sent = await (channel as TextChannel).send({ embeds: [embed] });
    updateChannels(guild.id, {
      eventTrackerMessage: sent.id
    });
  }
};
