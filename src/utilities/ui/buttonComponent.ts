import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { addButtonRecord } from "@handlers/interactionHandler.js";
import type { ButtonComponentOptions } from "@utilities/ui/types/buttonComponent.js";

export const createButtonComponent = (options: ButtonComponentOptions): ActionRowBuilder<ButtonBuilder> => {
  const button = new ButtonBuilder()
    .setLabel(options.label)
    .setStyle(options.style)
    .setCustomId(options.customId)
    .setDisabled(options.disabled ?? false)
    .setEmoji(options.emoji ?? "")
    .setURL(options.url ?? "");
  if (options.onClick !== undefined) {
    const buttonRecord = {
      customId: options.customId,
      onClick: options.onClick,
      ...(options.single === undefined ? {} : { options: { single: options.single } }),
    };
    addButtonRecord(buttonRecord);
  }
  return new ActionRowBuilder<ButtonBuilder>().addComponents(button);
};
