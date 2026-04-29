import type { TextChannel } from "discord.js";
import { getGuild, getChannels, updateChannels } from "@tables/guild/index.js";
import { cache } from "@/client.js";

export const startShipTracker = async (png: Buffer): Promise<void> => {
  for (const guild of cache.guilds) {
    const guildData = getGuild(guild.id);
    if (guildData === undefined) continue;
    const channels = getChannels(guild.id);
    if (!channels.shipTracker) continue;
    if (typeof channels.shipTrackerChannel !== "string" || !channels.shipTrackerChannel) continue;
    const channel = await guild.channels
      .fetch(channels.shipTrackerChannel)
      .catch((): undefined => undefined);
    if (channel?.isTextBased() !== true) continue;
    if (typeof channels.shipTrackerMessage !== "string" || !channels.shipTrackerMessage) continue;
    const fileName = `ships_${String(Date.now())}.png`;
    if (channels.shipTrackerMessage) {
      try {
        const message = await (channel as TextChannel).messages.fetch(
          channels.shipTrackerMessage
        );
        await message.edit({
          files: [{ attachment: png, name: fileName }],
          content: `<t:${String(Math.floor(Date.now() / 1000))}:R>`
        });
        continue;
      } catch {
        void 0;
      }
    }
    const sent = await (channel as TextChannel).send({
      files: [{ attachment: png, name: fileName }],
      content: `<t:${String(Math.floor(Date.now() / 1000))}:R>`
    });
    updateChannels(guild.id, {
      shipTrackerMessage: sent.id
    });
  }
};
