import type { EmbedBuilder, TextChannel } from "discord.js";
import { getGuild, getChannels, updateChannels } from "@tables/guild/index.js";
import { cache } from "@/client.js";

export const startPvpEventTracker = async (embed: EmbedBuilder): Promise<void> => {
  for (const guild of cache.guilds) {
    const guildData = getGuild(guild.id);
    if (!guildData) continue;
    const channels = getChannels(guild.id);
    if (!channels.pvpEventTracker) continue;
    if (typeof channels.pvpEventTrackerChannel !== "string" || !channels.pvpEventTrackerChannel) continue;
    const channel = await guild.channels.fetch(channels.pvpEventTrackerChannel).catch(() => null);
    if (channel?.isTextBased() !== true) continue;
    const textChannel = channel as TextChannel;
    if (typeof channels.pvpEventTrackerMessage === "string" && channels.pvpEventTrackerMessage) {
      try {
        const message = await textChannel.messages.fetch(channels.pvpEventTrackerMessage);
        await message.edit({ embeds: [embed] });
        continue;
      } catch {
        continue;
      }
    }
    const sent = await textChannel.send({ embeds: [embed] });
    updateChannels(guild.id, {
      pvpEventTrackerMessage: sent.id
    });
  }
};