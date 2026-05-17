import { EmbedBuilder } from "discord.js";
import type { CreateEmbedOptions } from "@utilities/components/types/embedComponent.js";

const createEmbed = ({
  title,
  description,
  thumbnail,
  footer,
  image,
  fields,
  color,
  options,
}: CreateEmbedOptions): EmbedBuilder => {
  const keepEmpty = options?.keepEmpty ?? false;
  const botIcon = options?.message?.client.user.displayAvatarURL({
    extension: "png",
    size: 1024,
  }) ?? options?.interaction?.client.user.displayAvatarURL({
        extension: "png",
        size: 1024,
      });

  const embed = new EmbedBuilder().setTimestamp();

  if (color !== undefined || keepEmpty) embed.setColor(color ?? "#464646");
  if (title !== undefined || keepEmpty) embed.setTitle(title ?? "No title");
  if (description !== undefined || keepEmpty) embed.setDescription(description ?? "No description");

  if (thumbnail !== undefined && thumbnail !== "") embed.setThumbnail(thumbnail);
  else if (botIcon !== undefined && botIcon !== "") embed.setThumbnail(botIcon);

  if (image !== undefined && image !== "") embed.setImage(image);

  if (footer !== undefined || keepEmpty) {
    const text = footer?.text ?? "Zenithra";
    const iconURL = footer?.iconURL ?? botIcon;
    if (iconURL === undefined) embed.setFooter({ text });
    else embed.setFooter({ text, iconURL });
  }

  if (options?.timestamp) embed.setTimestamp(options.timestamp);

  if (fields) embed.addFields(fields);

  return embed;
};

export default createEmbed;
