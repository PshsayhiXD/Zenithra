import { EmbedBuilder } from "discord.js";
import type { CreateEmbedOptions } from "@utilities/components/types/embedComponent.js";

export const createEmbed = (options: CreateEmbedOptions): EmbedBuilder => {
  const keepEmpty = options.options?.keepEmpty ?? false;
  const botIcon =
    options.options?.message?.client.user.displayAvatarURL({
      extension: "png",
      size: 1024,
    }) ??
    options.options?.interaction?.client.user.displayAvatarURL({
      extension: "png",
      size: 1024,
    });
  const embed = new EmbedBuilder().setTimestamp();
  if (options.color !== undefined || keepEmpty) embed.setColor(options.color ?? "#464646");
  if (options.title !== undefined || keepEmpty) embed.setTitle(options.title ?? "No title");
  if (options.description !== undefined || keepEmpty) embed.setDescription(options.description ?? "No description");
  if (options.thumbnail !== undefined && options.thumbnail !== "") embed.setThumbnail(options.thumbnail);
  else if (botIcon !== undefined && botIcon !== "") embed.setThumbnail(botIcon);
  if (options.image !== undefined && options.image !== "") embed.setImage(options.image);
  if (options.footer !== undefined || keepEmpty) {
    const text = options.footer?.text ?? "Zenithra";
    const iconURL = options.footer?.iconURL ?? botIcon;
    if (iconURL === undefined) embed.setFooter({ text });
    else embed.setFooter({ text, iconURL });
  }
  if (options.options?.timestamp) embed.setTimestamp(options.options.timestamp);
  if (options.fields) embed.addFields(options.fields);
  return embed;
};
